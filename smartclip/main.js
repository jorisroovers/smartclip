////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This file is the main electron program entry point - everything starts here :-)                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE: NodeJS doesn't support ES6-style imports yet (experimental in 11.x) - so we still use require()
const { app, ipcMain, BrowserWindow, Tray, clipboard } = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

const imagesDir = path.join(__dirname, 'images');

let SETTINGS = {
    "ui": {
        "clips": {
            "display": {
                "max-length": 50
            },
        },
        "hide-on-copy": true,
        "hide-dock-icon": true,
        "tray-icon": path.join(imagesDir, 'tray16x16.png'),
        "newline-representation": "&#8629;",
        "tab-representation": "[TAB]",
    },
    "dev-mode": false
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 310,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: true, // true for easy debugging with dev tools
        transparent: false,
        nodeIntegration: false // https://electronjs.org/docs/faq#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron
    });

    SETTINGS['dev-mode'] = process.env.SMARTCLIP_DEV == '1' || false;
    console.log("DEV MODE", SETTINGS['dev-mode']);
    if (SETTINGS['dev-mode']) {
        // Install react developer tools
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));

        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.toggleDevTools();
        mainWindow.setSize(700, 500);

        // DEV specific settings
        SETTINGS['ui']['hide-on-copy'] = false;
        SETTINGS['ui']['tray-icon'] = path.join(imagesDir, 'tray-dev16x16.png');



    } else {
        mainWindow.loadURL(`file://${__dirname}/../dist/index.html`);
    }

    if (SETTINGS['ui']['hide-dock-icon']) {
        app.dock.hide();
    }


    // We can access settings here like this:
    // const storage = require('electron-json-storage');
    // storage.get('settings.user', function (error, data) {
    //     // console.log(data);
    // });

    mainWindow.on('close', function (event) {
        console.log("close window")
        // if we're not really quitting, then just hide the window
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
    });

    mainWindow.on('hide', function () {
        tray.setHighlightMode('never');
    });

    mainWindow.on('show', function () {
        tray.setHighlightMode('always');
    });

    mainWindow.on('blur', function () {
        // When removing focus, hide window. This prevents weird cases where the window is hidden behind others.
        mainWindow.hide();
    });
}

function createTray() {
    tray = new Tray(SETTINGS['ui']['tray-icon']);
    // we have some of this going on:
    // http://stackoverflow.com/questions/38193739/how-to-make-electron-tray-click-events-working-reliably
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', function (event) {
        toggleWindow();
    });
}

function toggleWindow() {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        showWindow();
    }
}

function getWindowPosition() {
    const windowBounds = mainWindow.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 3)

    return {
        x: x,
        y: y
    }
};


function showWindow() {
    const position = getWindowPosition()
    mainWindow.setPosition(position.x, position.y, false)
    mainWindow.show()
    mainWindow.focus()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    app.isQuitting = false;
    createWindow();
    createTray();
});

// Quit when all windows are closed.s
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('before-quit', function () {
    console.log("Quiting!");
    app.isQuitting = true;
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

// events send by client

ipcMain.on('hide-window', function (event, arg) {
    mainWindow.hide();
});

ipcMain.on('toggle-dev-tools', function (event, arg) {
    mainWindow.webContents.toggleDevTools();
});

ipcMain.on('copy-clip', function (event, clipIndex) {
    let clip = smartclipboard.clips[clipIndex];
    smartclipboard.ignoreNext = true;

    if (clip.type == "text") {
        clipboard.writeText(clip.text);
    } else if (clip.type == "image") {
        clipboard.writeImage(clip.image);
    }
});

ipcMain.on('clear-clips', function (event, arg) {
    smartclipboard.clear();
    clipUpdateSender.send("clips-update", smartclipboard.clips);
});

ipcMain.on('action-execute', function (event, data) {
    // TODO: proper error handling
    let clip = smartclipboard.clips[data['clipIndex']];
    clip.actions[data['action']].execute();
});


let clipUpdateSender = null;
let clipboardBackend = require('./clipboard');
let smartclipboard = new clipboardBackend.SmartClipBoard();

// TODO: added test data at startup: not working?
// if (SETTINGS['dev-mode']) {
//     console.log("[DEV MODE] Populating with some sample data");
//     smartclipboard.addClip(smartclipboard.TextClip("test123 &#8629;"));
//     smartclipboard.addClip(smartclipboard.TextClip("https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url"));
// }

ipcMain.on('init', function (event, arg) {
    clipUpdateSender = event.sender;
    clipUpdateSender.send("init", SETTINGS);
    clipUpdateSender.send("clips-update", smartclipboard.clips);
    mainWindow.hide();
});

ipcMain.on('quit', function (event, arg) {
    app.quit();
});


smartclipboard.addClipWatcher(function (clip, clips) {
    clipUpdateSender.send("clips-update", smartclipboard.clips);
});
