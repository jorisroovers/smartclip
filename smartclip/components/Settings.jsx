'use strict';

import React from "react";

import { Page } from "./Navigation"

import { ipcRenderer } from "electron";


class SettingsView extends React.Component {

    constructor(props) {
        super(props);
        this.toggleDeveloperTools.bind(this)
    }

    toggleDeveloperTools() {
        ipcRenderer.send("toggle-dev-tools");
    }

    render() {
        return <Page>
            <h2>Settings</h2>
            <button onClick={this.toggleDeveloperTools}>Toggle Developer Tools</button>
            <p>Not a lot here, please come back later :-)</p>
        </Page>
    }
}

export default SettingsView