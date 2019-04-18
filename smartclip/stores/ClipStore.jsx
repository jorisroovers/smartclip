import { observable } from "mobx"
import { ipcRenderer } from "electron";


export default class ClipStore {

    @observable clips = [];

    findByUUID(uuid) {
        return this.clips.find((clip, index, array) => clip.uuid == uuid)
    }

    copyByUUID(uuid) {
        ipcRenderer.send('copy-clip', uuid);
    }

    pinByUUID(uuid) {
        ipcRenderer.send('pin-clip', uuid);
    }

    togglePinByUUID(uuid) {
        let clip = this.findByUUID(uuid);
        if (clip.sticky) {
            ipcRenderer.send('unpin-clip', uuid);
        } else {
            ipcRenderer.send('pin-clip', uuid);
        }
    }

    deleteByUUID(uuid) {
        ipcRenderer.send('delete-clip', uuid);
    }

    clear() {
        ipcRenderer.send('clear-clips');
    }

    isEmpty() {
        return this.clips.length == 0;
    }

}

const clipStore = new ClipStore();

ipcRenderer.on('clips-update', function (event, clips) {

    clipStore.clips.replace(clips);

    // Restore circular references of actions to their parent clip
    // These get lost when being send from the backend
    // (this makes sense as circular references cause a infinite loop during serialization).
    clipStore.clips.forEach(clip => {
        Object.values(clip.actions).forEach((action, actionType) => {
            action.clip = clip;
        })
    })
});

export { clipStore };