"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var Help = require('./Help.React');
var DisplayTabs = require('./DisplayTabs.react.js');
var BodyModal = require('./BodyModal.react.js');

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
                             <Help/>
                        </div>
                         <div className="collapse navbar-collapse" id="bs-navbar-collapse-1">
                          <MetricSearch />
                        </div>
                    </div>
                </nav>
                <DisplayTabs />
                <BodyModal />
            </div>
        );
        // add tabs
    }
});

module.exports = Master;
