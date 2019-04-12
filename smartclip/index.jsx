'use strict';
import css from './css/styles.css';
import './fonts/materialdesignicons-webfont.woff2';
import './css/materialdesignicons.min.css';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { ipcRenderer } from "electron";
import React from "react";
import ReactDOM from "react-dom";

import SETTINGS from './config';
import SettingsView from "./components/Settings"
import TrayMenu from "./components/TrayMenu"
import ClipDetailView from "./components/Clip"

import { clipStore } from "./stores/ClipStore"

ipcRenderer.send('init', true);

ipcRenderer.on('init', function (event, settings) {
    Object.assign(SETTINGS, settings); // use Object.assign instead of regular assignment, otherwise this won't work
    console.log(settings);
});


// ipcRenderer.on('clips-update', function (event, clips) {

// });



class AppRouter extends React.Component {

    render() {
        return (
            <Router>
                <div>
                    {/* use render() to pass props to component
                     https://github.com/ReactTraining/react-router/issues/5521 */}
                    <Route path="/" exact render={() => <TrayMenu clipStore={this.props.clipStore} />} />
                    <Route path="/settings/" component={SettingsView} />
                    <Route path="/clip/:id" render={(params) => <ClipDetailView params={params} clipStore={this.props.clipStore} />} />
                </div>
            </Router >
        );
    }
}


ReactDOM.render(
    <AppRouter clipStore={clipStore} />,
    document.getElementById('root')
);