import { observable, extendObservable } from "mobx"
import { ipcRenderer } from "electron";


export default class ClipStore {

    @observable clips = [];

    findByUUID(uuid) {
        return this.clips.find((clip, index, array) => clip.uuid == uuid)
    }

    clear() {
        console.log("Clearing clips!");
        ipcRenderer.send('clear-clips');
    }

}

const clipStore = new ClipStore();

ipcRenderer.on('clips-update', function (event, clips) {
    clipStore.clips.replace(clips);
    // clipStore.set{ clips: clips })
});

export { clipStore };