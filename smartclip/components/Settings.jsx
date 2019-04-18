'use strict';
import React from "react";
import { Page } from "./Navigation"
import { ipcRenderer } from "electron";
import SETTINGS from '../config'
import { observer } from "mobx-react";
import { setObjectValue, getObjectValue } from "../shared/utils"

@observer
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
            Clip Line Length: <SettingsTextInput setting="ui.clips.display.max-length" />
            Max Clipboard Size: <SettingsTextInput setting="max-clipboard-size" />

            <p>Not a lot here, please come back later :-)</p>
        </Page>
    }
}

@observer
class SettingsTextInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = { value: getObjectValue(SETTINGS, this.props.setting) };
        this.saveSetting = this.saveSetting.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ value: parseInt(event.target.value) });
    }

    saveSetting() {
        setObjectValue(SETTINGS, this.props.setting, this.state.value);
        ipcRenderer.send("save-settings", SETTINGS);
    }

    render() {
        return <div>
            <input value={this.state.value} type="text" onChange={this.handleChange} />
            <button onClick={this.saveSetting}>Save</button>
        </div>
    }

}

export default SettingsView