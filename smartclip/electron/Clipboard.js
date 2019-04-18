const clipboardWatcher = require('electron-clipboard-watcher')
const uuidv4 = require('uuid/v4');

const { ActionAnnotator } = require("./ClipActions");

const { clipboard } = require("electron");

const { SETTINGS } = require("./Settings");


class Clip {
    constructor(sticky = false) {
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

    constructor() {
        this.clips = [];
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

    findByUUID(uuid) {
        return this.clips.find((clip, index, array) => clip.uuid == uuid)
    }

    deleteByUUID(uuid) {
        this.clips = this.clips.filter(clip => clip.uuid !== uuid)

        // Notify observers
        for (let watcher of this.watchers) {
            watcher(null, this.clips);
        }
    }

    pinByUUID(clipUUID) {
        let clip = this.findByUUID(clipUUID);
        clip.sticky = true;

        // Notify observers
        for (let watcher of this.watchers) {
            watcher(clip, this.clips);
        }
    }

    unpinByUUID(clipUUID) {
        let clip = this.findByUUID(clipUUID);
        clip.sticky = false;

        // Notify observers
        for (let watcher of this.watchers) {
            watcher(clip, this.clips);
        }
    }

    addClip(clip, notifyWatchers = true) {
        if (!this.ignoreNext) {
            // Add actions to the clip
            ActionAnnotator.annotateClip(clip);

            // Add the clip to the front (not efficient but doesn't really matter for small array sizes)
            this.clips.unshift(clip);
            this.compact(false);

            // Notify observers
            if (notifyWatchers) {
                for (let watcher of this.watchers) {
                    watcher(clip, this.clips);
                }
            }

        }
        this.ignoreNext = false;
    }

    /**
     * Compacts the clipboard to only keep the `SETTINGS['max-clipboard-size']` most recent clips.
     */
    compact(notifyWatchers = true) {
        if (this.clips.length > SETTINGS['max-clipboard-size']) {
            let newClips = [];
            let i = 0;
            while (newClips.length < SETTINGS['max-clipboard-size'] && i < this.clips.length) {
                newClips.push(this.clips[i]);
                i++;
            }
            this.clips = newClips;

            // Notify observers
            if (notifyWatchers) {
                for (let watcher of this.watchers) {
                    watcher(null, this.clips);
                }
            }
        }
    }

    /**
     * Write a given object to the system clipboard. Knows how to deal with different clip and plain object types.
     * @param {*} obj Object to add.
     * @param {*} addClip Whether to also add the clip to the history of clips we maintain.
     */
    writeSystemClipboard(obj, keepInHistory = true) {
        if (obj instanceof TextClip) {
            this.ignoreNext = !keepInHistory;
            clipboard.writeText(obj.text);
        } else if (obj instanceof ImageClip) {
            this.ignoreNext = !keepInHistory;
            clipboard.writeImage(clip.image.nativeImage);
        } else if (typeof (obj) == "string") {
            this.ignoreNext = !keepInHistory;
            clipboard.writeText(obj);
        }
    }

    clear() {
        this.clips = [];
    }

}

const clipboardInstance = new SmartClipBoard();

module.exports.SmartClipBoard = clipboardInstance;
module.exports.TextClip = TextClip;
module.exports.ImageClip = ImageClip;