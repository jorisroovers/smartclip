import React from "react";

import { BackLink } from "./Navigation"

import { observer } from "mobx-react";

@observer
class ClipDetailView extends React.Component {

    render() {
        let clipUUID = this.props.params.match.params['id'];
        let clip = this.props.clipStore.findByUUID(clipUUID);
        return <div>
            <BackLink to="/" />
            <textarea className="clip-text-detail" defaultValue={clip.text}></textarea>
        </div>
    }
}

export default ClipDetailView