"use strict";

var React = require('react');
var ReactRedux = require('react-redux');
var ReactDOM = require('react-dom');
var connect = ReactRedux.connect;
var _ = require('underscore')


var NeuroglancerTab = React.createClass({
    render: function () {
        return <div/>;
    },
    shouldComponentUpdate: function(nextProps, nextState){

        if(!nextProps.active){
            return false
        }
        return true
    },
    getLayerNames: function(metric_results){
       var config_ground_label = metric_results.config['dvid-info']['label-name']
       var config_comp_label = metric_results.config['dvid-info-comp']['label-name']
       return ['grayscale', config_ground_label, config_comp_label];
    },
    componentWillReceiveProps: function(props){
        //check if neuroglancer layers need to be updated
        //1. get current layers
        if(!props.active){
            return;
        }
        var currentLayerSpecs = _.chain(viewer.layerManager.managedLayers)
                                 .pluck('initialSpecification')
                                 .map(function(spec){spec.found = false; return spec;}).value();

        //2. build the prospective specs (minus the metric data, as this incurs unnecessary computation at this stage)
        var server = props.metric_results.config['dvid-info']['dvid-server'];
        var uuid = props.metric_results.config['dvid-info']['full-uuid'];
        var layer_names = this.getLayerNames(props.metric_results);
        var new_specs = _.map(_.zip(layer_names, ['image', 'metric', 'metric']), function(val){
            return this.buildSourceSpec(server, uuid, val[0], val[1])
        }.bind(this));
        new_specs[1]['compType'] = new_specs[2]['compType'] = props.compType.toKey();
        new_specs[2]['__comp'] = true;
        //add skeleton references
        if(props.metric_results.config['dvid-info']['skeletons']){
            new_specs[1]['skeletons'] = props.metric_results.config['dvid-info']['skeletons'];
        }
        if(props.metric_results.config['dvid-info']['skeletons']){
            new_specs[2]['skeletons'] = props.metric_results.config['dvid-info-comp']['skeletons'];
        }

        //3. compare specs. Add/remove layers as needed
        for(var i=0; i<new_specs.length; i++){
          var spec = new_specs[i];
          for(var j=0; j<currentLayerSpecs.length; j++){
            var existingSpec = currentLayerSpecs[j];
            if (this.specsMatch(spec, existingSpec)){
                existingSpec['found'] = true;
                spec['found'] = true;
                break;
            }
          }
        }
        var specNotFound = function(spec){
            return !!!spec.found;
        }

        _.chain(currentLayerSpecs).filter(specNotFound).each(this.removeLayer);

        var toAdd = _.filter(new_specs, specNotFound)
        if(toAdd.length > 0){
            //make sure the viewer knows its correct size
            window.viewer.display.onResize();
            _.each(toAdd, _.partial(this.addLayer, _, props))
        }

        //update neuroglancer position, if needed
        if(props.position !== null && this.props.position !== props.position){
            this.updateCoordinates(props.position);
            //trigger a redraw
            window.viewer.display.onResize();
        }

    },
    specsMatch: function(specA, specB){
        return specA.type === specB.type &&
               specA.source === specB.source &&
               (specA.type === 'metric' ? specA.compType === specB.compType : true);
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
    addLayer: function(spec, props){
        //add metric data to the spec
        if(spec.type === 'metric'){
            var metricTypes = spec['__comp'] ? ['Test Frag', 'Best Test'] : ['GT Frag', 'Worst GT'];

            _.each(metricTypes, function(metricName){
                spec.metricData[metricName] = this.mungeSegmentMetrics(
                    props.metric_results.getBodyStats(props.compType, metricName)
                );
            }.bind(this));
        }

        viewer.layerManager.addManagedLayer(viewer.layerSpecification.getLayer(spec.__name, spec));

    },
    removeLayer: function(spec){
        var targetLayer = viewer.layerManager.getLayerByName(spec['__name']);
        if(targetLayer){
            viewer.layerManager.removeManagedLayer(targetLayer);
        }
    },
    mungeSegmentMetrics: function(body_data){
        return _.map(body_data, function(val){
                            return [parseInt(val[0]), val[1]];
                        });
    },
    buildSourceSpec: function(server, uuid, name, type){
        var sourceURL = 'dvid://http://' + server + '/' + uuid + '/' + name;
        var spec = {
               'type': type,
               'source': sourceURL,
               '__name': name
        }

        if(type === 'metric'){
            spec['metricData'] = {}
        }

        return spec;
    },
    componentDidMount: function(){
        //call neuroglancer method that initializes the view
        this.node = ReactDOM.findDOMNode(this);
        var neurogBaseDom = (
            <div className="container-fluid">
               <div className="row">
                   <div className='col-md-12'>
                        <div id="neurog-body">
                            <div id="container"></div>
                        </div>
                   </div>
              </div>
            </div>);
        ReactDOM.render(neurogBaseDom, this.node);
        InitializeNeuroglancer({auto_show_layer_dialog:false});
        //update neuroglancer orientation
        window.viewer.perspectiveNavigationState.zoomFactor.value = 64;
        window.viewer.perspectiveNavigationState.pose.orientation.orientation = [-.2, .25, .05,.95]
        window.viewer.perspectiveNavigationState.pose.orientation.changed.dispatch()

        this.prev_metric_results = {layer_names: [], server: null, shortuuid: null}
    },
    updateCoordinates: function(position){
        // position: Float32Array
        window.viewer.navigationState.pose.position.setVoxelCoordinates(position)
    }
});


var NeuroglancerState = function(state){
    return {
        metric_results: state.metric_results,
        active: (state.ActiveTab==2 ? true : false),
        position: state.position,
        compType: state.compType
    }
};

var NeuroglancerDispatch = function(dispatch){
    return {}
};

NeuroglancerTab = connect(NeuroglancerState, NeuroglancerDispatch)(NeuroglancerTab)

module.exports = NeuroglancerTab;