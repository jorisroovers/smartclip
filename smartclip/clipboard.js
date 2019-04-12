const clipboardWatcher = require('electron-clipboard-watcher')
const uuidv4 = require('uuid/v4');
const { shell, clipboard } = require("electron");

class Clip {
    constructor(clip, sticky = false) {
        this.sticky = sticky;
        this.type = "base";
        this.uuid = uuidv4();
        this.actions = {};
    }

    addAction(clipAction) {
        this.actions[clipAction.type] = clipAction;
    }
}


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

class TextClip extends Clip {
    constructor(text, sticky = false) {
        super(sticky);
        this.type = "text";
        this.text = text;
        if (isURL(this.text)) {
            this.addAction(new OpenURLAction(this));
        }
        if (isJson(this.text)) {
            this.addAction(new CopyJsonAction(this));
        }
    }

}

class ImageClip extends Clip {
    constructor(image, sticky = false) {
        super(sticky);
        this.type = "image";
        this.image = image;
    }
}

class SmartClipBoard {

    constructor(clipThreshold = 25) {
        this.clips = [];
        this.clipThreshold = clipThreshold;
        this.watchers = [];
        var self = this;

        // Whether to ignore the next incoming clip. We use this to ignore items we've put on the clipboard ourselves.
        // This approach isn't ideal but it works for now :-)
        this.ignoreNext = false;

        clipboardWatcher({
            watchDelay: 500,
            onImageChange: function (nativeImage) {
                self.addClip(new ImageClip(nativeImage));

            },
            onTextChange: function (text) {
                self.addClip(new TextClip(text));
            }
        });
    }

    addClipWatcher(watcher) {
        this.watchers.push(watcher);
    }

    addClip(clip) {
        if (!this.ignoreNext) {

            this.clips.unshift(clip);
            if (this.clips.length > this.clipThreshold) {
                this.clips.pop();
            }
            for (let watcher of this.watchers) {
                watcher(clip, this.clips);
            }
        }
        this.ignoreNext = false;
    }

    clear() {
        this.clips = [];
    }

}

class ClipAction {
    constructor(type, clip, icon, tooltip) {
        this.uuid = uuidv4();
        this.type = type;
        this.icon = icon;
        this.tooltip = tooltip;
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
        clipboard.writeText(jsonStr);
    }

}

module.exports.SmartClipBoard = SmartClipBoard;