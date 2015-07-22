"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var StackViewer = require('./StackViewer.React');
var BodyTable = require('./BodyTable.React');
var MainTable = require('./MainTable.React');
var CompType = require('../helpers/CompType');

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
            compType: new CompType()
        };

    },
    loadData: function (data) {
        this.setState({metric_results: data});
    },
    handleType: function (data) {
        this.setState({compType: data});
    },
    render: function () {
        var substack_component = <div />;
        var maintable_component = <div />;
        var bodytable_component = <div />;

        if (this.state.metric_results !== null) {
            substack_component = (
                <div className="col-md-6">
                <StackViewer comptype={this.state.compType.toKey()} substacks={this.state.metric_results.subvolumes["ids"]} />
                </div>
            );
            maintable_component = (
                <div className="col-md-3">
                <MainTable metric_data={this.state.metric_results} />
                </div>
            );
            bodytable_component = (
                <div className="col-md-3">
                <BodyTable comptype={this.state.compType} metric_data={this.state.metric_results} />
                </div>
            );
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
                            <a className="navbar-brand" href="#">EM Segmentation Evaluation</a>
                        </div>
                         <div className="collapse navbar-collapse" id="bs-navbar-collapse-1">
                            <MetricSearch typeCallback={this.handleType} callback={this.loadData} />
                        </div>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                    {maintable_component}
                    {bodytable_component}
                    {substack_component}
                    </div>
                </div>
            </div>
        );
        // add tabs
    }
});


module.exports = Master;
