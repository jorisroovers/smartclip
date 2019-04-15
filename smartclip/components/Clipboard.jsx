'use strict';

import { ipcRenderer } from "electron";
import React from "react";

import { Link } from "react-router-dom";
import SETTINGS from '../config'

import { observer, toJS } from "mobx-react";

import { ClipAction } from "./Clip"

@observer
class ClipboardView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.clipStore.clips.length == 0) {
            return <div className="no-clips-yet">Clipboard is empty, please copy something to have it show up here!</div>
        }

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
        return <div onClick={this.activateClip} className="clip">
            <ClipListRepresentation clip={this.props.clip} />
            <div className="clip-actions">
                {Object.values(this.props.clip.actions).map((action) =>
                    <ClipAction key={action.uuid} action={action} clipIndex={this.props.clipIndex} showTitle={false} />
                )}
                <ClipDetailsButton clip={this.props.clip} />
            </div>
        </div>;
    }
}

@observer
class ClipListRepresentation extends React.Component {


    render() {
        if (this.props.clip.type == "text") {
            return <TextClipListRepresentation clip={this.props.clip} />
        } else if (this.props.clip.type == "image") {
            return <ImageClipListRepresentation clip={this.props.clip} />
        }

        return <div>ERROR: Unknown clip type</div>

    }
}

class TextClipListRepresentation extends React.Component {

    render() {
        let clipRepresentation = this.props.clip.text;
        // clipRepresentation = clipRepresentation.replace("\n", SETTINGS.ui['newline-representation'])

        if (clipRepresentation.length > (SETTINGS['ui']['clips']['display']['max-length'] + 3)) {
            clipRepresentation = clipRepresentation.substr(0, SETTINGS['ui']['clips']['display']['max-length']) + "...";
        }
        return clipRepresentation;
    }

}

class ImageClipListRepresentation extends React.Component {
    render() {
        return <img className="clip-image-representation" src={this.props.clip.image.dataURL} />
    }

}


@observer
class ClipDetailsButton extends React.Component {

    constructor(props) {
        super(props);
        this.clickButton.bind(this);
    }

    clickButton(event) {
        // extra click handler neccessary to stop event propagation.
        event.stopPropagation();
    }

    render() {
        return <div className="clip-details-button">
            <Link to={`/clip/${this.props.clip.uuid}`} onClick={this.clickButton}>
                <span className={"mdi mdi-dots-horizontal"}></span>
            </Link>
        </div>
    }
}

export { ClipboardView };
