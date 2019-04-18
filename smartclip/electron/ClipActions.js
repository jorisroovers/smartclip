const { shell } = require("electron");

const { SETTINGS } = require("./Settings");

const uuidv4 = require('uuid/v4');

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function isURL(url) {
    let expression = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    let regex = new RegExp(expression);
    return url.match(regex) != null;
};

class ClipAction {
    constructor(type, clip, icon, title) {
        this.uuid = uuidv4();
        this.type = type;
        this.icon = icon;
        this.title = title;
        this.clip = clip;
    }

    execute() {
        console.log(`ClipAction for Clip ${this.clip.uuid} - default execute()`);
    }

}

class OpenURLAction extends ClipAction {

    constructor(clip) {
        super("open-url", clip, "mdi-link-variant", "Open URL in browser");
    }

    execute() {
        console.log(`open URL: ${this.clip.text}`);
        shell.openExternal(this.clip.text);
    }

}

class CopyJsonAction extends ClipAction {

    constructor(clip) {
        super("copy-json", clip, "mdi-json", "Copy as formatted JSON");
    }

    execute() {
        console.log(`Copy json: ${this.clip.text}`);
        let json = JSON.parse(this.clip.text);
        let jsonStr = JSON.stringify(json, null, 4);
        let clipboardBackend = require('./Clipboard');
        let SmartClipBoard = clipboardBackend.SmartClipBoard;
        SmartClipBoard.writeSystemClipboard(jsonStr, false);
    }

}


class SaveAsFileAction extends ClipAction {

    constructor(clip) {
        super("save-text-file", clip, "mdi-file-download-outline", "Save As File");
    }

    execute() {
        const fs = require('fs');
        const path = require('path');
        const moment = require('moment');

        const filename = moment().format("[smartclip]-YYYY-MM-DD_HH-mm-ss[.txt]");
        const filepath = path.join(SETTINGS['actions']['save-text-file']['file-save-dir'], filename);
        fs.writeFile(filepath, this.clip.text, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log(`Successfully saved file to ${filepath}`);
        });
    }

}


class ActionAnnotator {

    static annotateClip(clip) {
        if (clip.type == "text") {
            return ActionAnnotator.annotateTextClip(clip);
        } else if (clip.type == "image") {
            return ActionAnnotator.annotateImageClip(clip);
        }
        return clip;
    }

    static annotateTextClip(clip) {
        if (isURL(clip.text)) {
            clip.addAction(new OpenURLAction(clip));
        }
        if (isJson(clip.text)) {
            clip.addAction(new CopyJsonAction(clip));
        }
        clip.addAction(new SaveAsFileAction(clip));
        return clip;
    }

    static annotateImageClip(clip) {
        return clip;
    }

}

module.exports.ActionAnnotator = ActionAnnotator;