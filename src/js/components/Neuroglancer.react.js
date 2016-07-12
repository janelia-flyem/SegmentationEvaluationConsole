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
                        <div className="neurog-body">
                            <div id="container"></div>
                        </div>
                   </div>
              </div>
            </div>


        );
    },
    componentDidUpdate: function(prevProps, prevState){
        //don't draw anything unless neuroglancer tab is visible
        if(this.props.active){
            //check to see if any layers need to be added
            //todo: test to see how this behaves for metric reload. May want to remove layers that are no longer relevant
            var config_ground_label = this.props.metric_results.config['dvid-info']['label-name']
            var config_comp_label = this.props.metric_results.config['dvid-info-comp']['label-name']
            var layer_names = ['grayscale', config_ground_label, config_comp_label].sort()
            var loaded_layer_names = _.pluck(window.viewer.layerManager.managedLayers, 'name').sort()

            var all_layers_loaded = _.isEqual(layer_names,loaded_layer_names)

            if (!all_layers_loaded){
                console.log('adding layers')
                //get full uuid, then add layers
                //ASSUMPTION: all layers use the same server and uuid
                var server = this.props.metric_results.config['dvid-info']['dvid-server']
                var shortuuid = this.props.metric_results.config['dvid-info']['uuid']

                this.getFullUUID_Promise(server, shortuuid)
                    .then(function(fulluuid){
                        this.addLayers(_.difference(layer_names,loaded_layer_names), server, fulluuid)
                    }.bind(this))
            }
            //update neuroglancer position, if needed
            if(this.props.position !== null && prevProps.position !== this.props.position){
                this.updateCoordinates(this.props.position)
                //trigger a redraw
                window.viewer.display.onResize()
            }

        }
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
        //todo: make an accessable function in the script for adding the viewer, so this script can be
        //loaded on initial page load without issues (function will be called here)
        //necessary for testing locally in chrome
        var body = $('body')
        body.append('<script src="neuroglancer/main.bundle.js"></script>')
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