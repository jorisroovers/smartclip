'use strict';

import React from "react";
import { ipcRenderer } from "electron";

import { ClipboardView } from "./Clipboard"
import { Link } from "react-router-dom";

import { observer } from "mobx-react";

@observer
class TrayMenu extends React.Component {

    constructor(props) {
        super(props);
        this.quit = this.quit.bind(this);
        // thanks: https://stackoverflow.com/questions/37440408/how-to-detect-esc-key-press-in-react-and-how-to-handle-it/46123962
        this.escFunction = this.escFunction.bind(this);
    }

    render() {
        return <div>
            <ClipboardView clipStore={this.props.clipStore} />
            <div className="status-bar">
                <button className="clear" onClick={this.props.clipStore.clear}>Clear</button>
                <Link className="settings" to="/settings/" >Settings</Link>
                <a href="#" className="quit" onClick={this.quit}>Quit</a>
            </div>
        </div>
    }


    quit(event) {
        ipcRenderer.send('quit');
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

export default TrayMenu