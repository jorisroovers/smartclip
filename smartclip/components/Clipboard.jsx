'use strict';

import { ipcRenderer } from "electron";
import React from "react";

import { Link } from "react-router-dom";
import SETTINGS from '../config'
import { observer, toJS } from "mobx-react";
import { ClipAction } from "./Clip"
import { clipStore } from "../stores/ClipStore.jsx"

import classNames from 'classnames/bind';


@observer
class ClipboardView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (clipStore.isEmpty()) {
            return <div className="no-clips-yet">Clipboard is empty, please copy something to have it show up here!</div>
        }

        return <div className="clipboard">
            <div className="pinned-clips">
                {clipStore.clips.map((clip, idx) =>
                    clip.sticky && <ClipListItem key={clip.uuid} clip={clip} />
                )}
            </div>
            <div className="unpinned-clips">
                {clipStore.clips.map((clip, idx) =>
                    !clip.sticky && <ClipListItem key={clip.uuid} clip={clip} />
                )}
            </div>
        </div>;
    }
}

@observer
class ClipListItem extends React.Component {
    constructor(props) {
        super(props);
        this.activateClip = this.activateClip.bind(this);
    }

    activateClip() {
        clipStore.copyByUUID(this.props.clip.uuid);
        if (SETTINGS.ui['hide-on-copy']) {
            ipcRenderer.send('hide-window', true);
        }
    }

    render() {
        let classes = classNames({ clip: true, pinned: this.props.clip.sticky });
        return <div onClick={this.activateClip} className={classes}>
            <ClipListItemRepresentation clip={this.props.clip} />
            <div className="clip-actions">
                <ClipItemPin clip={this.props.clip} />
                {Object.values(this.props.clip.actions).map((action) => {
                    return SETTINGS['quick-actions'].includes(action.type) &&
                        <ClipAction key={action.uuid} action={action} showTitle={false} />
                }
                )}
                <ClipDetailsButton clip={this.props.clip} />
            </div>
        </div>;
    }
}
@observer
class ClipItemPin extends React.Component {

    constructor(props) {
        super(props);
        this.togglePin = this.togglePin.bind(this)
    }

    togglePin() {
        clipStore.togglePinByUUID(this.props.clip.uuid);
    }

    render() {
        if (this.props.clip.sticky) {
            return <span onClick={this.togglePin} className={"pin-clip-item-pinned"}></span>
        } else {
            return <span onClick={this.togglePin} className={"pin-clip-item-unpinned"}></span>
        }
    }
}

@observer
class ClipListItemRepresentation extends React.Component {


    render() {
        if (this.props.clip.type == "text") {
            return <TextClipListRepresentation clip={this.props.clip} />
        } else if (this.props.clip.type == "image") {
            return <ImageClipListRepresentation clip={this.props.clip} />
        }

        return <div>ERROR: Unknown clip type</div>

    }
}
@observer
class TextClipListRepresentation extends React.Component {

    render() {
        let clipRepresentation = this.props.clip.text;
        clipRepresentation = clipRepresentation.replace(/\n/g, SETTINGS.ui['newline-representation']);

        if (clipRepresentation.length > (SETTINGS['ui']['clips']['display']['max-length'] + 3)) {
            clipRepresentation = clipRepresentation.substr(0, SETTINGS['ui']['clips']['display']['max-length']) + "...";
        }
        return clipRepresentation;
    }

}
@observer
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
