////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This file is the main electron program entry point - everything starts here :-)                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE: NodeJS doesn't support ES6-style imports yet (experimental in 11.x) - so we still use require()
const { app, ipcMain, BrowserWindow, Tray, clipboard } = require('electron');
const path = require('path');

const { SETTINGS } = require("./Settings");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

const imagesDir = path.join(__dirname, 'images');

////////////////////////////////////////////////////////////////////////////////
// Window Handling                                                            //
////////////////////////////////////////////////////////////////////////////////
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

    mainWindow.on('close', function (event) {
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

// Quit when all windows are closed.
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


////////////////////////////////////////////////////////////////////////////////
// Application related IPC                                                    //
////////////////////////////////////////////////////////////////////////////////


let clipboardBackend = require('./Clipboard');
let smartclipboard = clipboardBackend.SmartClipBoard;
let clipUpdateSender = null;

ipcMain.on('init', function (event, arg) {
    clipUpdateSender = event.sender;
    smartclipboard.addClipWatcher(function (clip, clips) {
        clipUpdateSender.send("clips-update", smartclipboard.clips);
    });

    // Update client
    clipUpdateSender.send("settings-update", SETTINGS);
    clipUpdateSender.send("clips-update", smartclipboard.clips);

    mainWindow.hide();
    if (SETTINGS['dev-mode']) {
        console.log("[DEV MODE] Populating with some sample data");
        smartclipboard.addClip(new clipboardBackend.TextClip("test123", true));
        smartclipboard.addClip(new clipboardBackend.TextClip('{"person": { "name": "john", "age": 43}}'));
        smartclipboard.addClip(new clipboardBackend.TextClip("https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url"));
    }

});

ipcMain.on('hide-window', function (event, arg) {
    mainWindow.hide();
});

ipcMain.on('toggle-dev-tools', function (event, arg) {
    mainWindow.webContents.toggleDevTools();
});

ipcMain.on('quit', function (event, arg) {
    app.quit();
});


ipcMain.on('save-settings', function (event, newSettings) {
    Object.assign(SETTINGS, newSettings);
    smartclipboard.compact(); // settings might impact clipboard size
    console.log(SETTINGS);
});

////////////////////////////////////////////////////////////////////////////////
// Clipboard related IPC                                                      //
////////////////////////////////////////////////////////////////////////////////

ipcMain.on('copy-clip', function (_, clipUUID) {
    let clip = smartclipboard.findByUUID(clipUUID);
    smartclipboard.writeSystemClipboard(clip, false);
});

ipcMain.on('delete-clip', function (_, clipUUID) {
    smartclipboard.deleteByUUID(clipUUID);
});

ipcMain.on('pin-clip', function (_, clipUUID) {
    console.log("TODO: pinning");
    smartclipboard.pinByUUID(clipUUID);
});

ipcMain.on('unpin-clip', function (_, clipUUID) {
    console.log("TODO: unpinning");
    smartclipboard.unpinByUUID(clipUUID);
});

ipcMain.on('clear-clips', function (_, arg) {
    smartclipboard.clear();
    clipUpdateSender.send("clips-update", smartclipboard.clips);
});

ipcMain.on('action-execute', function (event, data) {
    let clip = smartclipboard.findByUUID(data['clipUUID'])
    clip.actions[data['action']].execute();
});
