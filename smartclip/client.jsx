'use strict';
const ipcRenderer = window.require("electron").ipcRenderer;

const React = require("react");
const ReactDOM = require("react-dom"); //.ReactDOM;

ipcRenderer.send('register-for-clip-updates', true);


class Clipboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {greeting: "foo"}
    }

    setClipboard(item) {
        this.setState({greeting: item});
    }

    render() {
        return <h1>Hello, {this.props.name}, {this.state.greeting}</h1>;
    }
}

ReactDOM.render(
    <Clipboard name="joris"/>,
    document.getElementById('root')
);

ipcRenderer.on('clip-added', function (event, args) {
    console.log("args", args[0]);
    ReactDOM.render(
        <Clipboard name={args[0]}/>,
        document.getElementById('root')
    );
});