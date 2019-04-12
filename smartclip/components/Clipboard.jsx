'use strict';

import { ipcRenderer } from "electron";
import React from "react";

import { Link } from "react-router-dom";
import SETTINGS from '../config'

import { observer } from "mobx-react";

@observer
class ClipboardView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="clipboard">
            {this.props.clipStore.clips.map((clip, idx) =>
                <ClipView key={clip.uuid} clipIndex={idx} clip={clip} />
            )}
        </div>;
    }
}

@observer
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
            <div className="clip-actions">
                {clipActions}
                <ClipDetailsButton clip={this.props.clip} />
            </div>
        </div>;
    }
}

@observer
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

@observer
class ClipDetailsButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="clip-details-button">
            <Link to={`/clip/${this.props.clip.uuid}`}>
                <span className={"mdi mdi-dots-horizontal"}></span>
            </Link>
        </div>
    }
}

export { ClipboardView };
