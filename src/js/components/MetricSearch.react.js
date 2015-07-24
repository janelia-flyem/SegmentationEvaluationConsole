"use strict";

window.$ = window.jQuery = require('jquery');
var React = require('react');
var JobInfo = require('./JobInfo.React');
var RetrieveExp = require('./RetrieveExp.React');

var MetricSearch = React.createClass({
    getInitialState: function () {
        return {
            dvid_server: null,
            uuid: null,
            exp_name: null,
            exp_list: [],
            ds_error: false,
            du_error: false,
            waiting: false,
            metric_results: null
        };
    },
    changeType: function (compType) {
        this.props.typeCallback(compType);
    },
    changeMetric: function (metric_data) {
        this.setState({metric_results: metric_data});
        this.props.callback(metric_data);
    },
    render: function () {
        var jobinfo_component = <div />;

        if (this.state.metric_results !== null) {
            jobinfo_component = (
                <JobInfo callback={this.changeType} metric_data={this.state.metric_results} />
            );
        }
        
        return (
            <div>
            <RetrieveExp callback={this.changeMetric} /> 
            {jobinfo_component}
            </div>
        ); 

    } 
});


module.exports = MetricSearch;
