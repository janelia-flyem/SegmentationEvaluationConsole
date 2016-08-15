"use strict";

var React = require('react');
var ReactRedux = require('react-redux')
var connect = ReactRedux.connect
var StackViewer = require('./StackViewer.React');
var BodyTable = require('./BodyTable.React');
var MainTable = require('./MainTable.React');

var MetricViewer = React.createClass({

    render: function (){
        return (<div className="container-fluid">
           <div className="row">
                <div className="col-md-4">
                    <MainTable comptype={this.props.compType} metric_data={this.props.metric_results} />
                </div>
                <div className="col-md-3">
                    <BodyTable comptype={this.props.compType} metric_data={this.props.metric_results} />
                </div>
                <div className="col-md-5">
                    <StackViewer
                        rcomptype={this.props.compType}
                        comptype={this.props.compType.toKey()}
                        substacks={this.props.metric_results.subvolumes["ids"]}
                     />
                </div>
            </div>
        </div>);

    }
});

var MetricViewerState = function(state){
    return {
        compType: state.compType,
        metric_results: state.metric_results
    }
};

var MetricViewerDispatch = function(dispatch){
    return {}
};

MetricViewer = connect(MetricViewerState, MetricViewerDispatch)(MetricViewer)

module.exports = MetricViewer