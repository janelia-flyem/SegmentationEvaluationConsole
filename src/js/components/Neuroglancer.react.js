"use strict";

var React = require('react');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;
var _ = require('underscore')


var NeuroglancerTab = React.createClass({
    render: function () {
        return (
            <div className="container-fluid">
               <div className="row">
                   <div className='col-md-12'>
                        <div id="neurog-body">
                            <div id="container"></div>
                        </div>
                   </div>
              </div>
            </div>


        );
    },
    shouldComponentUpdate: function(nextProps, nextState){

        if(!nextProps.active){
            return false
        }
        return true
    },
    getLayerNames(metric_results){
       var config_ground_label = metric_results.config['dvid-info']['label-name']
       var config_comp_label = metric_results.config['dvid-info-comp']['label-name']
       return ['grayscale', config_ground_label, config_comp_label].sort()
    },
    componentDidUpdate: function(prevProps, prevState){
            //check to see if any layers need to be added
            var server = this.props.metric_results.config['dvid-info']['dvid-server'];
            var shortuuid = this.props.metric_results.config['dvid-info']['uuid'];
            var layer_names = this.getLayerNames(this.props.metric_results);

            var same_layer_names = _.isEqual(layer_names, this.prev_metric_results.layer_names);
            var same_server = server === this.prev_metric_results.server;
            var same_uuid = shortuuid === this.prev_metric_results.shortuuid;


            if ( !(same_layer_names && same_server && same_uuid)){
                //update metrics for future comparisions
                this.prev_metric_results = {layer_names: layer_names, server:server, shortuuid:shortuuid}
                //remove current layers
                viewer.layerManager.clear()

                //update the position to the stack midpoint
                this.update_position_to_midpoint(this.props.metric_results)

                //get full uuid, then add layers
                //ASSUMPTION: all layers use the same server and uuid
                this.getFullUUID_Promise(server, shortuuid)
                    .then(function(fulluuid){
                        this.addLayers(this.getLayerNames(this.props.metric_results), server, fulluuid)
                    }.bind(this))
            }
            //update neuroglancer position, if needed
            if(this.props.position !== null && prevProps.position !== this.props.position){
                this.updateCoordinates(this.props.position)
                //trigger a redraw
                window.viewer.display.onResize()
            }

    },
    update_position_to_midpoint: function(metric_results){
        var substacks = metric_results.data.subvolumes.ids
        var max = [0,0,0];
        var min = [Infinity,Infinity,Infinity];

        for(var sid in substacks){
            var currind = [substacks[sid].roi[0],substacks[sid].roi[1], substacks[sid].roi[2]];
            _.each(currind, function(indval, i){
                if(indval > max[i]){
                    max[i] = indval;
                }
                if(indval < min[i]){
                    min[i] = indval
                }
            });
        }
        var minmax = _.zip(min,max)
        var midpoint = _.map(minmax, function(minmax, i){
                return minmax[0] + ((minmax[1]-minmax[0])/2);
        });

        this.updateCoordinates(new Float32Array(midpoint));
    },
    addLayers: function(layernames_to_load, server, uuid){
        //make the viewer think it's resizing so that height/width
        //will be set to nonzero size and layers can load
        window.viewer.display.onResize()

        //munge configs so they can be used to build layers
        var ground_config = this.props.metric_results.config['dvid-info']
        //make a config for the grayscale image. ASSUMPTION: image will be called 'grayscale' on dvid
        var ground_config_img = Object.assign({}, ground_config, {'type': 'image', 'label-name': 'grayscale'})
        var comp_config = this.props.metric_results.config['dvid-info-comp']
        _.each([ground_config,comp_config],function (config){
            config.type = 'segmentation'
        })

        //create the layers
        _.each([ground_config_img, ground_config, comp_config], function (config){
              if(_.contains(layernames_to_load, config['label-name'])){
                var sourceSpec = this.buildSourceSpec(server,
                                                      config['type'],
                                                      config['label-name'],
                                                      uuid)
                var layer = viewer.layerSpecification.getLayer( config['label-name'],
                                                                sourceSpec)
                var managedLayer = viewer.layerManager.addManagedLayer(layer)
              }
        }.bind(this))

    },
    buildSourceSpec: function(server, type, name, uuid){
        var sourceURL = 'dvid://http://' + server + '/' + uuid + '/' + name
        return {
               'type': type,
               'source': sourceURL
        }
    },
    getFullUUID_Promise: function(server,uuid){
        /**
           Creates a promise that resolves to the full uuid using the dvid API
        **/
        var headers = new Headers({
           'Content-Type': 'text/plain'
        });
        var request = new Request('http://' + server + '/api/repo/' + uuid + '/info', {
            'headers': headers,
            'method': 'get'
        });

        return fetch(request)
            .then(function(response) {
                return response.json();
            })
            .then(function(json){
                //find the full uuid given the list of nodes names in the dag
                return _.find(_.keys(json['DAG']['Nodes']), function(fulluuid){
                    return fulluuid.slice(0, uuid.length) === uuid
            })}.bind(this))
            .catch(function(err) {
                //todo: better error handling
                console.log(err)
            });

    },
    componentDidMount: function(){
        //call neuroglancer method that initializes the view
        InitializeNeuroglancer({auto_show_layer_dialog:false})
        this.prev_metric_results = {layer_names: [], server: null, shortuuid: null}
    },
    updateCoordinates(position){
        // position: Float32Array
        window.viewer.navigationState.pose.position.setVoxelCoordinates(position)
    }
});


var NeuroglancerState = function(state){
    return {
        metric_results: state.metric_results,
        active: (state.ActiveTab==2 ? true : false),
        position: state.position
    }
};

var NeuroglancerDispatch = function(dispatch){
    return {}
};

NeuroglancerTab = connect(NeuroglancerState, NeuroglancerDispatch)(NeuroglancerTab)

module.exports = NeuroglancerTab;