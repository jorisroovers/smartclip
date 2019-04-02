'use strict';
import css from './css/styles.css';
import './fonts/materialdesignicons-webfont.woff2';
import './css/materialdesignicons.min.css';

const ipcRenderer = window.require("electron").ipcRenderer;

const React = require("react");
const ReactDOM = require("react-dom"); //.ReactDOM;

ipcRenderer.send('init', true);

let SETTINGS = {};

ipcRenderer.on('init', function (event, settings) {
    SETTINGS = settings;
    console.log(settings);
});

class ClipboardView extends React.Component {

    constructor(props) {
        super(props);
        // thanks: https://stackoverflow.com/questions/37440408/how-to-detect-esc-key-press-in-react-and-how-to-handle-it/46123962
        this.escFunction = this.escFunction.bind(this);
        this.clearClips = this.clearClips.bind(this);
    }

    render() {
        let clipViews = [];
        for (let i = 0; i < this.props.clips.length; i++) {
            clipViews.push(<ClipView key={this.props.clips[i].uuid} clipIndex={i} clip={this.props.clips[i]} />);
        }
        return <div className="clipboard">
            {clipViews}
            <button onClick={this.clearClips}>Clear</button>
        </div>;
    }

    clearClips(event) {
        ipcRenderer.send('clear-clips', this.props.clip);
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            ipcRenderer.send('hide-window', true);
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }
}

class ClipView extends React.Component {
    constructor(props) {
        super(props);
        this.activateClip = this.activateClip.bind(this);
    }

    activateClip() {
        ipcRenderer.send('copy-clip', this.props.clipIndex);
        if (SETTINGS.ui['hide-on-copy']) {
            ipcRenderer.send('hide-window', true);
        }
    }

    render() {
        let clipRepresentation = "";
        let clipActions = [];

        for (let actionType in this.props.clip.actions) {
            let action = this.props.clip.actions[actionType];
            console.log(action);
            clipActions.push(<ClipAction key={action.uuid} action={action} clipIndex={this.props.clipIndex} />)
        }

        if (this.props.clip.type == "text") {
            clipRepresentation = this.props.clip.text;
            // clipRepresentation = clipRepresentation.replace("\n", SETTINGS.ui['newline-representation'])

            if (clipRepresentation.length > (SETTINGS['ui']['clips']['display']['max-length'] + 3)) {
                clipRepresentation = clipRepresentation.substr(0, SETTINGS['ui']['clips']['display']['max-length']) + "...";
            }
        } else if (this.props.clip.type == "image") {
            clipRepresentation = "[ image ]";
        } else {
            clipRepresentation = "";
        }

        return <div onClick={this.activateClip} className="clip">
            {clipRepresentation}
            <div className="clip-actions">{clipActions}</div>
        </div>;
    }
}

class ClipAction extends React.Component {

    constructor(props) {
        super(props);
        this.clickAction = this.clickAction.bind(this);
    }

    clickAction(event) {
        ipcRenderer.send('action-execute', { "clipIndex": this.props.clipIndex, "action": this.props.action.type });
        event.stopPropagation();
    }

    render() {
        return <div onClick={this.clickAction} className="clip-action">
            <span className={`mdi ${this.props.action.icon}`}></span>
        </div>
    }

}

ipcRenderer.on('clips-update', function (event, clips) {
    ReactDOM.render(
        <ClipboardView clips={clips} />,
        document.getElementById('root')
    );
});

