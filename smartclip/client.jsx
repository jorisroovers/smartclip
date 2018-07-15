'use strict';
const ipcRenderer = window.require("electron").ipcRenderer;

const React = require("react");
const ReactDOM = require("react-dom"); //.ReactDOM;

ipcRenderer.send('register-for-clip-updates', true);

import css from './css/styles.css';

class ClipboardView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let clipViews = [];
        for (let i = 0; i < this.props.clips.length; i++) {
            clipViews.push(<ClipView key={i} clip={this.props.clips[i]} />);
        }
        return <div className="clipboard">{clipViews}</div>;
    }
}

class ClipView extends React.Component {
    constructor(props) {
        super(props);
        this.state = { greeting: "foo" }
    }

    setClipboard(item) {
        this.setState({ greeting: item });
    }

    render() {
        return <div className="clip">{this.props.clip.text}</div>;
    }
}

ipcRenderer.on('clip-added', function (event, clips) {
    ReactDOM.render(
        <ClipboardView clips={clips} />,
        document.getElementById('root')
    );
});