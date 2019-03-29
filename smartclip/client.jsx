'use strict';
const ipcRenderer = window.require("electron").ipcRenderer;

const React = require("react");
const ReactDOM = require("react-dom"); //.ReactDOM;

ipcRenderer.send('init', true);

let SETTINGS = {};

ipcRenderer.on('init', function (event, settings) {
    SETTINGS = settings;
    console.log(settings);
});

import css from './css/styles.css';

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
            clipViews.push(<ClipView key={i} clipIndex={i} clip={this.props.clips[i]} />);
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
        this.state = { greeting: "foo" }
        this.activateClip = this.activateClip.bind(this);
        console.log(this.props);
    }

    setClipboard(item) {
        this.setState({ greeting: item });
    }

    activateClip() {
        ipcRenderer.send('copy-clip', this.props.clipIndex);
        if (SETTINGS.ui['hide-on-copy']) {
            ipcRenderer.send('hide-window', true);
        }
    }

    render() {
        let clipRepresentation = "";
        if (this.props.clip.type == "text") {
            clipRepresentation = this.props.clip.text;
            if (clipRepresentation.length > 53) {
                clipRepresentation = clipRepresentation.substr(0, 50) + "...";
            }
        } else if (this.props.clip.type == "image") {
            clipRepresentation = "[ image ]";
        } else {
            clipRepresentation = "";
        }

        return <div onClick={this.activateClip} className="clip">{clipRepresentation}</div>;
    }
}

ipcRenderer.on('clips-update', function (event, clips) {
    ReactDOM.render(
        <ClipboardView clips={clips} />,
        document.getElementById('root')
    );
});

