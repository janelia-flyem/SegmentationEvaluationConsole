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
   findSkeletons: function(server, uuid){
        //builds the skeleton reference needed by neuroglancer
        var buildSkeletonRef = function(dataInstanceName, keyvalue_metadata){
            if(keyvalue_metadata.type = 'skeleton' && keyvalue_metadata.labelblk){
                return [keyvalue_metadata.labelblk, 'dvid://http://' + server + '/' + uuid + '/' + dataInstanceName];
            }
            return;
        }
        //request repo info
        var info_request = new Request('http://' + server + '/api/repo/' + uuid + '/info', {
            'headers': new Headers({'Content-Type': 'text/plain'}),
            'method': 'get'
        });
        fetch(info_request)
            .then(function(response){
                return response.json();
            })
            .then(function(repo_info){
                //create a new request for each dataInstance to get its meta key (if it exists),
                //then build a skeleton reference for each skeleton dataInstance
                var skeletonInfoPromises = _.chain(repo_info.DataInstances)
                    .filter(function(data_instance_info){ 
                        return data_instance_info.Base && data_instance_info.Base.TypeName === "keyvalue";
                    })
                    .map(function(key_value_info){
                        var request = new Request('http://' + server + '/api/node/' + uuid + '/' + key_value_info.Base.Name + "/key/meta", {
                            'headers': new Headers({'Content-Type': 'text/plain'}),
                            'method': 'get'
                        });
                        return fetch(request)
                            .then(function(response){
                                if(!response.ok) throw new Error('DataInstance missing meta key');
                                return response.json();
                            })
                            .then(_.partial(buildSkeletonRef, key_value_info.Base.Name))
                            .catch(function(err){return;});//errors are to be expected--not all keyvalue instances will have meta keys
                    })
                    .value();

                //collect skeleton results
                Promise.all(skeletonInfoPromises)
                    .then(function(values){
                        this.props.updateSkeletons(new Map(_.filter(values, _.negate(_.isUndefined))));
                    }.bind(this));
            }.bind(this))
            .catch(function(err){
                this.props.updateSkeletons(null)
            }.bind(this));
    },
    handleMetricData: function(data){
        this.props.loadData(data);
        this.findSkeletons(data.config['dvid-info']['dvid-server'], data.config['dvid-info']['uuid']);
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
            <RetrieveExp className="navbar-form navbar-right" callback={this.handleMetricData} />
            {jobinfo_component}
            </div>
        ); 

    } 
});

var MetricSearchState = function(state){
    return {
        compType: state.main.compType,
        metric_results: state.main.metric_results
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
        updateSkeletons: function(data){
            dispatch({
                type: 'UPDATE_SKELETON_SOURCES',
                skeletonMap: data
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
