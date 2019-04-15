const clipboardWatcher = require('electron-clipboard-watcher')
const uuidv4 = require('uuid/v4');

const { ActionAnnotator } = require("./ClipActions");


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


class TextClip extends Clip {
    constructor(text, sticky = false) {
        super(sticky);
        this.type = "text";
        this.text = text;
    }

}

class ImageClip extends Clip {
    constructor(nativeImage, sticky = false) {
        super(sticky);
        this.type = "image";
        this.image = { dataURL: nativeImage.toDataURL(), nativeImage: nativeImage }
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
            // Add actions to the clip
            ActionAnnotator.annotateClip(clip);

            // Add the clip to the front (not efficient but doesn't really matter for small array sizes)
            this.clips.unshift(clip);
            if (this.clips.length > this.clipThreshold) {
                this.clips.pop();
            }

            // Notify observers
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