"use strict";

var Master = require('./components/Master.react');
var React = require('react');
var ReactDOM = require('react-dom')
var ConsoleReducers = require('./reducers')
var ReactRedux = require('react-redux')
var Redux = require('redux')
var Provider = ReactRedux.Provider

// load css that contains bootstrap
var filename = "css/main.min.css";
var fileref = document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", filename);
document.getElementsByTagName("head")[0].appendChild(fileref);

// sample application to test component
//var serviceloc = "http://127.0.0.1:8000/api/node/5b7/service/key";
var store = Redux.createStore(ConsoleReducers)

// Renders component just to a DIV with DVIDServiceWidget.
function loadInterface() {
    var serviceloc,
        element = document.getElementById("segeval");

    ReactDOM.render(
        <Provider store={store}>
            <Master />
        </Provider>,
        document.getElementById("segeval")
    );
}

// do not render component until
if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', loadInterface);
} else {
    $(document).ready(loadInterface);
}



