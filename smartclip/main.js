const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({width: 300, height: 300});

    const DEBUG_MODE = process.env.SMARTCLIP_DEBUG == '1' || false;

    mainWindow.loadURL('http://localhost:8080');
    // mainWindow.loadURL(`file://${__dirname}/../dist/index.html`);

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


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    app.isQuitting = false;
    createWindow();
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
ipcMain.on('toggle-dev-tools', function (event, arg) {
    mainWindow.webContents.toggleDevTools();
});


const clipboardWatcher = require('electron-clipboard-watcher')
clipboardWatcher({
    // (optional) delay in ms between polls
    watchDelay: 500,
    // handler for when image data is copied into the clipboard
    onImageChange: function (nativeImage) {
        console.log("Image copied");
        console.log(nativeImage);

    },
    // handler for when text data is copied into the clipboard
    onTextChange: function (text) {
        console.log("text copied");
        console.log(text);
    }
});