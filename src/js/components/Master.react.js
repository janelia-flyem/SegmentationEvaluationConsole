"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var StackViewer = require('./StackViewer.React');
var JobInfo = require('./JobInfo.React');
var BodyTable = require('./BodyTable.React');
var MainTable = require('./MainTable.React');

window.$ = window.jQuery = require('jquery');

/*
 * Master component that allows a user to select a
 * DVID server and a corresponding segmentation
 * evaluation experiment. 
*/
var Master = React.createClass({
    getInitialState: function () {
        return {
            metric_results: null
        };

    },
    loadData: function (data) {
        this.setState({metric_results: data});
    },
    render: function () {
        var substack_component = <div />;
        var jobinfo_component = <div />;
        var maintable_component = <div />;
        var bodytable_component = <div />;

        if (this.state.metric_results !== null) {
            substack_component = (
                <div className="col-md-6">
                <StackViewer comptype="voxels:voxels" substacks={this.state.metric_results["subvolumes"]["ids"]} />
                </div>
            );
            jobinfo_component = (
                <div className="col-md-12">
                <JobInfo metric_data={this.state.metric_results} />
                </div>
            );
            maintable_component = (
                <div className="col-md-3">
                <MainTable metric_data={this.state.metric_results} />
                </div>
            );
            bodytable_component = (
                <div className="col-md-3">
                <BodyTable comptype="voxels:voxels" metric_data={this.state.metric_results} />
                </div>
            );
        }
                
        //<a className="navbar-brand" href="#"><img alt="Brand" src="https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png" /></a>
        return (
            <div>
                <nav className="navbar navbar-default">
                    <div className="container-fluid">                                                           <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">EM Segmentation Evaluation</a>
                        </div>
                        <MetricSearch callback={this.loadData} />
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                    {jobinfo_component}
                    </div>
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
