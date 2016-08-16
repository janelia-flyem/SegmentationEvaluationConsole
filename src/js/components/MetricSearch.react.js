"use strict";

window.$ = window.jQuery = require('jquery');
var React = require('react');
var ReactRedux = require('react-redux')
var connect = ReactRedux.connect
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
    render: function () {
        var jobinfo_component = <div />;

        if (this.props.metric_results !== null) {
            jobinfo_component = (
                <JobInfo callback={this.props.handleType} metric_data={this.props.metric_results} />
            );
        }
        
        return (
            <div>
            <RetrieveExp className="navbar-form navbar-right" callback={this.props.loadData} />
            {jobinfo_component}
            </div>
        ); 

    } 
});

var MetricSearchState = function(state){
    return {
        compType: state.compType,
        metric_results: state.metric_results
    }
};

var MetricSearchDispatch = function(dispatch){
    return {
        loadData: function(data) {
            dispatch({
                type: 'LOAD_DATA',
                data: data
            });
        },
        handleType: function(data) {
            dispatch({
                type: 'HANDLE_TYPE',
                data: data
            });
        }
    }
};

MetricSearch = connect(MetricSearchState, MetricSearchDispatch)(MetricSearch)


module.exports = MetricSearch;
