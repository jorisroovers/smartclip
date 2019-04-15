import React from "react";

import { Page } from "./Navigation"

import { observer } from "mobx-react";

import { ipcRenderer } from "electron";

@observer
class ClipDetailView extends React.Component {

    render() {
        let clipUUID = this.props.params.match.params['id'];
        let clip = this.props.clipStore.findByUUID(clipUUID);
        return <Page>
            <ClipEditor clip={clip} />
            <div className="clip-actions"></div>
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
                <h1>Actions</h1>
                {Object.values(this.props.clip.actions).map((action) =>
                    <ClipAction key={action.uuid} action={action} clipIndex={this.props.clipIndex} />
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
        ipcRenderer.send('action-execute', { "clipIndex": this.props.clipIndex, "action": this.props.action.type });
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

export { ClipAction, ClipDetailView };