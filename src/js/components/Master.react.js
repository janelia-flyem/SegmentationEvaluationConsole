"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var StackViewer = require('./StackViewer.React');
var BodyTable = require('./BodyTable.React');
var MainTable = require('./MainTable.React');
var CompType = require('../helpers/CompType');
var Help = require('./Help.React');

window.$ = window.jQuery = require('jquery');

/*
 * Master component that allows a user to select a
 * DVID server and a corresponding segmentation
 * evaluation experiment. 
*/
var Master = React.createClass({
    getInitialState: function () {
        return {
            metric_results: null,
            compType: new CompType(),
            helpMode: false
        };

    },
    loadData: function (data) {
        this.setState({metric_results: data});
    },
    handleType: function (data) {
        this.setState({compType: data});
    },
    toMain: function () {
        this.setState({helpMode: false});
    },
    toHelp: function () {
        this.setState({helpMode: true});
    },
    render: function () {
        var substack_component = <div />;
        var maintable_component = <div />;
        var bodytable_component = <div />;
        var help_component = <div />;

        if ((!this.state.helpMode) && (this.state.metric_results !== null)) {
            substack_component = (
                <div className="col-md-6">
                <StackViewer rcomptype={this.state.compType} comptype={this.state.compType.toKey()} substacks={this.state.metric_results.subvolumes["ids"]} />
                </div>
            );
            maintable_component = (
                <div className="col-md-3">
                <MainTable comptype={this.state.compType} metric_data={this.state.metric_results} />
                </div>
            );
            bodytable_component = (
                <div className="col-md-3">
                <BodyTable comptype={this.state.compType} metric_data={this.state.metric_results} />
                </div>
            );
        }
              
        var metric_comp = <MetricSearch typeCallback={this.handleType} callback={this.loadData} />;

        if (this.state.helpMode) {
            help_component = <Help />;
            metric_comp = <ul className="nav navbar-nav navbar-right"><li>Help</li></ul>
        }

        //<a className="navbar-brand" href="#"><img alt="Brand" src="https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png" /></a>
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
                            <a className="navbar-brand" onClick={this.toMain}>EM Segmentation Evaluation</a>
                            <a className="navbar-brand" onClick={this.toHelp}><span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span></a>
                        </div>
                         <div className="collapse navbar-collapse" id="bs-navbar-collapse-1">
                            {metric_comp} 
                        </div>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                    {maintable_component}
                    {bodytable_component}
                    {substack_component}
                    {help_component}
                    </div>
                </div>
            </div>
        );
        // add tabs
    }
});


module.exports = Master;
