const clipboardWatcher = require('electron-clipboard-watcher')

class Clip {
    constructor(clip, sticky = false) {
        this.sticky = sticky;
    }
}

class TextClip extends Clip {
    constructor(text, sticky = false) {
        super(sticky);
        this.text = text;
    }
}

class ImageClip extends Clip {
    constructor(image, sticky = false) {
        super(sticky);
        this.image = image;
    }
}

class SmartClipBoard {

    constructor(clipThreshold = 25) {
        this.clips = [];
        this.clipThreshold = clipThreshold;
        this.watchers = [];
        var self = this;
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
        this.clips.unshift(clip);
        if (this.clips.length > this.clipThreshold) {
            this.clips.pop();
        }
        for (let watcher of this.watchers) {
            watcher(clip, this.clips);
        }
    }
}

module.exports.SmartClipBoard = SmartClipBoard;