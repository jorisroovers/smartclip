const { app, ipcMain, BrowserWindow, Tray, clipboard } = require('electron')
const path = require('path')

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
        "hide-on-copy": true
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 250,
        height: 310,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: true, // true for easy debugging with dev tools
        transparent: false,
        'node-integration': false
    });

    const DEV_MODE = process.env.SMARTCLIP_DEV == '1' || false;
    console.log("DEV MODE", DEV_MODE);
    if (DEV_MODE) {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.toggleDevTools();
        mainWindow.setSize(700, 500);
    } else {
        mainWindow.loadURL(`file://${__dirname}/../dist/index.html`);
    }

    // We can access settings here like this:
    // const storage = require('electron-json-storage');
    // storage.get('settings.user', function (error, data) {
    //     // console.log(data);
    // });

    mainWindow.on('close', function (event) {
        // if we're not really quitting, then just hide the window
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
    });
}

function createTray() {
    tray = new Tray(path.join(imagesDir, 'tray16x16.png'));
    // we have some of this going on:
    // http://stackoverflow.com/questions/38193739/how-to-make-electron-tray-click-events-working-reliably
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', function (event) {
        console.log("TRAY CLICKED");
        toggleWindow();
    });
}

function toggleWindow() {
    showWindow();
    console.log(mainWindow);

    // if (mainWindow.isVisible()) {
    //     console.log("isVisible");
    //     mainWindow.hide();
    // } else {
    //     console.log("showWindow");
    //     showWindow();
    // }
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
    mainWindow.show();
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
    console.log(clipIndex);
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

clipboard.writeText('Example String')

let clipUpdateSender = null;
let clipboardBackend = require('./clipboard');
let smartclipboard = new clipboardBackend.SmartClipBoard();

ipcMain.on('init', function (event, arg) {
    console.log("Init server-side");
    clipUpdateSender = event.sender;
    clipUpdateSender.send("init", SETTINGS);
    clipUpdateSender.send("clips-update", smartclipboard.clips);
    mainWindow.hide();
});

smartclipboard.addClipWatcher(function (clip, clips) {
    console.log("clip logged", clips);
    clipUpdateSender.send("clips-update", smartclipboard.clips);
});
