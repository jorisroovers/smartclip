const clipboardWatcher = require('electron-clipboard-watcher')

class Clip {
    constructor(clip, sticky) {
        this.clip = clip;
        this.sticky = sticky;
    }
}

class SmartClipBoard {

    constructor(clipThreshold = 3) {
        this.clips = [];
        this.clipThreshold = clipThreshold;
        this.watchers = [];
        var self = this;
        clipboardWatcher({
            watchDelay: 500,
            onImageChange: function (nativeImage) {
                console.log("Image copied");
                console.log(nativeImage);

            },
            onTextChange: function (text) {
                self.addClip(text)
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