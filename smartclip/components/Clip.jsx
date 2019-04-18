import React from "react";

import { Page } from "./Navigation"

import { observer } from "mobx-react";

import { ipcRenderer } from "electron";

import { withRouter } from 'react-router-dom';

import { clipStore } from "../stores/ClipStore.jsx"

@observer
class ClipDetailView extends React.Component {

    render() {
        let clipUUID = this.props.params.match.params['id'];
        let clip = this.props.clipStore.findByUUID(clipUUID);
        return <Page>
            <ClipEditor clip={clip} />
            <ClipControlsWithRouter clip={clip} />
        </Page>
    }
}

class ClipEditor extends React.Component {
    render() {
        switch (this.props.clip.type) {
            case "text": {
                return <ClipTextEditor clip={this.props.clip} />
            }
            case "image": {
                return <ClipImageEditor clip={this.props.clip} />
            }
            default:
                return "[clip type unknown]"
        }
    }
}

class ClipTextEditor extends React.Component {

    render() {
        return <div>
            <textarea className="clip-text-detail" defaultValue={this.props.clip.text}></textarea>
            <div>
                <span>Formatters</span>
            </div>
            <div>
                <span>Info</span>
            </div>
            <div>
                Actions
                {Object.values(this.props.clip.actions).map((action) =>
                    <ClipAction key={action.uuid} action={action} />
                )}
            </div>
        </div>
    }
}

class ClipImageEditor extends React.Component {

    render() {
        return <img src={this.props.clip.image.dataURL} className="image-editor" />
    }

}

@observer
class ClipAction extends React.Component {

    constructor(props) {
        super(props);
        this.clickAction = this.clickAction.bind(this);
    }

    static defaultProps = {
        "showTitle": true
    }

    clickAction(event) {
        ipcRenderer.send('action-execute', { "clipUUID": this.props.action.clip.uuid, "action": this.props.action.type });
        event.stopPropagation();
    }

    render() {
        return <div onClick={this.clickAction} className="clip-action">
            {this.props.action.icon.startsWith("fa-") &&
                <i className={`fa ${this.props.action.icon}`} aria-hidden="true"></i>
            }
            {this.props.action.icon.startsWith("mdi-") &&
                <span className={`mdi ${this.props.action.icon}`}></span>
            }

            {this.props.showTitle &&
                <span>&nbsp; {this.props.action.title}</span>
            }
        </div>
    }
}

class ClipControls extends React.Component {

    constructor(props) {
        super(props);
        this.deleteClip = this.deleteClip.bind(this);
        this.copyClip = this.copyClip.bind(this);
        this.togglePinClip = this.togglePinClip.bind(this);
    }


    deleteClip() {
        let deleteConfirmed = confirm("Are you sure you want to delete this clip?");
        if (deleteConfirmed) {
            clipStore.deleteByUUID(this.props.clip.uuid);
            this.props.history.push("/");
        }
    }

    copyClip() {
        clipStore.copyByUUID(this.props.clip.uuid);
    }

    togglePinClip() {
        clipStore.togglePinByUUID(this.props.clip.uuid);
    }

    render() {
        return <div className="clip-controls">
            <button className="delete-clip-button" onClick={this.deleteClip}>Delete</button>
            <button className="pin-clip-button" onClick={this.togglePinClip}>Pin</button>
            <button className="copy-clip-button" onClick={this.copyClip}>Copy</button>
        </div>
    }

}

const ClipControlsWithRouter = withRouter(ClipControls);


export { ClipAction, ClipDetailView };