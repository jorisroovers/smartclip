const clipboardWatcher = require('electron-clipboard-watcher')

class Clip {
    constructor(clip, sticky = false) {
        this.sticky = sticky;
        this.type = "base"
    }
}

class TextClip extends Clip {
    constructor(text, sticky = false) {
        super(sticky);
        this.type = "text";
        this.text = text;
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
            this.clips.indexOf(clip)

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

module.exports.SmartClipBoard = SmartClipBoard;