"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var Help = require('./Help.React');
var MetricViewer = require('./MetricViewer.react.js')
var ReactRedux = require('react-redux')
var connect = ReactRedux.connect

window.$ = window.jQuery = require('jquery');

/*
 * Master component that allows a user to select a
 * DVID server and a corresponding segmentation
 * evaluation experiment. 
*/
var Master = React.createClass({
    render: function () {

        return (
            <div>
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand">EM Segmentation Evaluation</a>
                            <a className="navbar-brand" onClick={this.props.toHelp}><span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span></a>
                        </div>
                         <div className="collapse navbar-collapse" id="bs-navbar-collapse-1">
                          <MetricSearch />
                        </div>
                    </div>
                </nav>
                <div style={this.props.ViewHelp ? {} : {display:'none'}}>
                    <Help />
                </div>
                <MetricViewer />
            </div>
        );
        // add tabs
    }
});

var MasterState = function(state){
    return {
        ViewHelp: state.ViewHelp
    }
};

var MasterDispatch = function(dispatch){
    return {
        toHelp: function() {
            dispatch({
                type: 'TOGGLE_HELP',
            });
        }

    }
};

Master = connect(MasterState, MasterDispatch)(Master)

module.exports = Master;
