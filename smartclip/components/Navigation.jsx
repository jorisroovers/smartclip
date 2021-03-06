'use strict';

import React from "react";
import { Link } from "react-router-dom";

import "../css/font-awesome.min.css"

class BackLink extends React.Component {

    render() {
        return <div className="back-link">
            <i className="fa fa-chevron-left" aria-hidden="true"></i>
            <Link to={this.props.to}>Back</Link>
        </div>
    }
}

class Page extends React.Component {
    render() {
        return <div className="page">
            <BackLink to="/">Back</BackLink>
            {this.props.children}
        </div>
    }
}

export { BackLink, Page };