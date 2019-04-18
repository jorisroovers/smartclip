import { ipcRenderer } from "electron";
import { observable } from "mobx"


var SETTINGS = {};

ipcRenderer.on('settings-update', function (_, settings) {
    Object.assign(SETTINGS, observable(settings)); // use Object.assign instead of regular assignment, otherwise this won't work
    console.log(SETTINGS);
});


export default SETTINGS;
