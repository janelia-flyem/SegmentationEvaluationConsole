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
                                 .pluck('initialSpecification').value()
        var stackLayer = _.filter(currentLayerSpecs,function(spec){return spec.type === 'stack';})[0];
        currentLayerSpecs = _.chain(currentLayerSpecs)
                                 .filter(function(spec){return spec.type !== 'stack';})
                                 .map(function(spec){spec.found = false; return spec;}).value();

        if(currentLayerSpecs.length === 0 && !!props.stackData){
            this.updateCoordinates(props.stackData.stackMidpoint);
        }
        //2. build the prospective specs (minus the metric data, as this incurs unnecessary computation at this stage)
        var server = props.metric_results.config['dvid-info']['dvid-server'];
        var uuid = props.metric_results.config['dvid-info']['uuid'];
        var layer_names = this.getLayerNames(props.metric_results);
        var new_specs = _.map(_.zip(layer_names, ['image', 'metric', 'metric']), function(val){
            return this.buildSourceSpec(server, uuid, val[0], val[1])
        }.bind(this));
        new_specs[1]['compType'] = new_specs[2]['compType'] = props.compType.toKey();
        new_specs[2]['__comp'] = true;

        //add skeleton references
        if(this.props.skeletonMap){
            _.each(new_specs, function(spec){
                var skeletonRef = this.props.skeletonMap.get(spec['__name'])
                if(skeletonRef){
                    spec['skeletons'] = skeletonRef;
                }
            }.bind(this))
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
        //select body
        if(props.ngSelectedBodyID !== null && props.ngSelectedBodyID !== this.props.ngSelectedBodyID){
            this.props.disposeModal();
            this.addSkeleton(props.ngSelectedBodyID, props.ngSelectedLayer);
        }

        //add stack overlay
        if(props.stackData && props.stacklayerReloadNeeded){
            if(stackLayer){
                this.removeLayer(stackLayer)
            }
            //don't tie up the UI by adding stackview overlay.
            //since the overlay is not initially displayed
            setTimeout(function(stackData, addLayer){
                var spec = {
                    __name: 'stack overlay',
                    source: 'dvid://stack' + Math.random(),//add a random number so neuroglancer will know this is new data.
                    type: 'stack',                         //TODO: should instead use the metric name(s)
                    stackData: stackData,
                    dataScaler: 8,
                    visible: false
                }
                //add the layer
                addLayer(spec, {});
            }.bind({}, props.stackData, this.addLayer), 0);

            props.stacklayerRefreshComplete();

        }

    },
    specsMatch: function(specA, specB){
        return specA.type === specB.type &&
               specA.source === specB.source &&
               (specA.type === 'metric' ? specA.compType === specB.compType : true);
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
    addSkeleton(skeletonID, layerName){
        var layer = viewer.layerManager.getLayerByName(layerName);
        if(!layer){
            return;
        }
        layer = layer.layer;
        layer.addSegment(skeletonID);
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
        metric_results: state.main.metric_results,
        active: (state.main.ActiveTab==2 ? true : false),
        position: state.main.position,
        compType: state.main.compType,
        skeletonMap: state.main.skeletonMap,
        ngSelectedBodyID: state.bodyModal.ngSelectedBodyID,
        ngSelectedLayer: state.bodyModal.ngSelectedLayer,
        stackData: state.main.stackData,
        stacklayerReloadNeeded: state.main.stacklayerReloadNeeded
    }
};

var NeuroglancerDispatch = function(dispatch){
    return {        
        disposeModal: function() {
            dispatch({
                type: 'DISPOSE_BODY_MODAL',
            });
        },
        stacklayerRefreshComplete: function(){
            dispatch({
                type: 'RELOAD_STACK_LAYER',
                reloadNeeded: false
            });
        }
    }
};

NeuroglancerTab = connect(NeuroglancerState, NeuroglancerDispatch)(NeuroglancerTab)

module.exports = NeuroglancerTab;