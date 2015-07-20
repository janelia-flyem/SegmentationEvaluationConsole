"use strict";

var React = require('react');
var MetricSearch = require('./MetricSearch.React');

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
        setState({metric_results: data});
    },
    render: function () {
        return (
                <div className="container">
                    <div className="page-header">
                    <h1>EM Segmentation Evaluation</h1>
                    </div>
                    <MetricSearch callback={this.loadData} />
                </div>
        );
        // add tabs
    }
});


module.exports = Master;
