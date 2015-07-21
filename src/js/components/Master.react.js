"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');
var StackViewer = require('./StackViewer.React');

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
        var tableview_component = <div />; 
        var substack_component = <div />;

        if (this.state.metric_results !== null) {
            tableview_component = (
                <div className="col-md-6">
                </div>
            );
            substack_component = (
                <div className="col-md-6">
                <StackViewer metric="VI" comptype="voxels:voxels" substacks={this.state.metric_results["subvolumes"]["ids"]} />
                </div>
            );
        }
                
        return (
                <div className="container-fluid">
                    <div className="page-header">
                    <h1>EM Segmentation Evaluation</h1>
                    </div>
                    <div className="row">
                    <MetricSearch callback={this.loadData} />
                    </div>
                    <div className="row">
                    {tableview_component}
                    {substack_component}
                    </div>
                </div>
        );
        // add tabs
    }
});


module.exports = Master;
