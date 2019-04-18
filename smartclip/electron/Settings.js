const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const homedir = require('os').homedir();


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
        "newline-representation": "\u23CE", // "&#8629;", ⏎
        "tab-representation": "[TAB]"
    },
    "max-clipboard-size": 25,
    "quick-actions": ["copy-json", "open-url"],
    "actions": {
        "save-text-file": {
            "file-save-dir": path.join(homedir, "Downloads")
        }
    },
    "dev-mode": false
};

module.exports.SETTINGS = SETTINGS;