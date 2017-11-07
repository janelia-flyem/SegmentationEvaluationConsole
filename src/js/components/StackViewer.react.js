"use strict"

var React = require('react');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;
var StackViewerLib = require('stack3d');
var ReactDOM = require('react-dom');
var _ = require('underscore')

var NumColors = 10;

var StackViewer = React.createClass({
    getInitialState: function () {
         // find default metric 
         var typename = this.props.comptype;
         var defmetric = "";
         for (var sid in this.props.substacks) {
            var substackmetrics = this.props.substacks[sid];
            // assume all substacks have the same stats
            for (var mid = 0; mid < substackmetrics.length; mid++) {
                var metricdata = substackmetrics[mid];
                if ("display" in metricdata) {
                    if (!metricdata["display"]) {
                        continue;
                    }
                }
                if (metricdata["name"] === "bbox") {
                    continue;
                }
                if (metricdata["typename"] != typename) {
                    continue;
                }
                defmetric = metricdata["name"];
                break;
            }
            break; 
        }
         
        return {
            metric: defmetric,
            viewer: null
        };
    },
    getStat : function (substack, comptype) {
        for (var mid = 0; mid < substack.length; mid++) {
            var metricdata = substack[mid];
            if ((metricdata["name"] === this.state.metric) &&
                (metricdata["typename"] === comptype)) {
                return metricdata["val"];
            }
        } 

        // should not reach
        return 0;
    },
    getHigherBetter : function () {
        for (var sid in this.props.substacks) {
            var substackmetrics = this.props.substacks[sid];
            for (var mid = 0; mid < substackmetrics.length; mid++) {
                var metricdata = substackmetrics[mid];
                if ((metricdata["name"] === this.state.metric) &&
                        (metricdata["typename"] === this.props.comptype)) {
                    return metricdata["higher-better"];
                }
            } 
        }

        // should not reach
        return true;
    },
    getbbox : function (substack) {
        for (var mid = 0; mid < substack.length; mid++) {
            var metricdata = substack[mid];
            if (metricdata["name"] === "bbox") {
                return metricdata["val"];
            }
        } 

        // should not reach
        return null;
    },
    getColorRange: function(substacks, comptype) {
        var minval = 1000000000;
        var maxval = 0;

        for (var sid in substacks) {
            var total = this.getStat(substacks[sid], comptype);
            if (total < minval) {
                minval = total;
            }
            if (total > maxval) {
                maxval = total;
            }
        }

        var incr = (maxval - minval)/NumColors;

        return [minval, maxval, incr]; 
    },
    getROIStats : function (substack, comptype) {
        var output_str = "<br>";
        for (var mid = 0; mid < substack.length; mid++) {
            var stat = substack[mid];
            if (stat["name"] === "bbox") {
                continue;
            }
            if (stat["typename"] === comptype) {
                 output_str += ("&nbsp&nbsp<b>" + stat["name"] + "</b>: " + stat["val"] + "<br>");
            }
        }
        
        return output_str;
    },
    loadColors: function(colorrange, comptype) {
        var colors = {
            0: {"name": "0", "color": "#043CDC"},
            1: {"name": "1", "color": "#1F3AC4"},
            2: {"name": "2", "color": "#3B38AD"},
            3: {"name": "3", "color": "#573696"},
            4: {"name": "4", "color": "#73347E"},
            5: {"name": "5", "color": "#8F3367"},
            6: {"name": "6", "color": "#AB3150"},
            7: {"name": "7", "color": "#C72F38"},
            8: {"name": "8", "color": "#E32D21"},
            9: {"name": "9", "color": "#FF2C0A"}
        };

        for (var i = 0; i < NumColors; i++) {
            var val = colorrange[0]+i*colorrange[2];
           
            // check order for type
            if (this.getHigherBetter()) {
                val = colorrange[1]-val;
            }
            colors[i]["name"] = val.toFixed(2);
        }
       
        return colors;
    },
    loadSubstacks: function(substacks, comptype) {
        var payload = {};
        payload["substacks"] = [];
        
        // determine stack dims
        var maxx = 0;
        var minx = 100000000;
        var maxy = 0;
        var miny = 100000000;
        var maxz = 0;
        var minz = 100000000;

        var colorrange = this.getColorRange(substacks, comptype);

        for (var sid in substacks) {
            var subobj = {};
            var bbox = this.getbbox(substacks[sid]);

            // load ROI info
            var x1 = bbox[2];
            var y1 = bbox[1];
            var z1 = bbox[0];
            var x2 = bbox[5];
            var y2 = bbox[4];
            var z2 = bbox[3];

            subobj["width"] = x2-x1;
            subobj["length"] = y2-y1;
            subobj["height"] = z2-z1;
            //popup receives substack midpoint
            subobj["x"] = x1 + subobj["width"]/2;
            subobj["y"] = y1 + subobj["length"]/2;
            subobj["z"] = z1 + subobj["height"]/2;

            var volume = subobj["width"]*subobj["height"]*subobj["length"];

            // get stack extents
            if (x1 < minx) {
                minx = x1;
            }
            if (x2 > maxx) {
                maxx = x2;
            }
            if (y1 < miny) {
                miny = y1;
            }
            if (y2 > maxy) {
                maxy = y2;
            }
            if (z1 < minz) {
                minz = z1;
            }
            if (z2 > maxz) {
                maxz = z2;
            }

            // substack id
            subobj["id"] = String(sid);

            var valstat = this.getStat(substacks[sid], comptype);
            subobj["status"] = valstat;
            // !! hacks into annotations for now
            //subobj["annotations"] = this.getROIStats(substacks[sid]);
            subobj["annotations"] = this.getROIStats(substacks[sid], comptype)
            // !! hack footer container into annotations for now as well
            subobj["annotations"] += '<div class="modal-footer"></div>'

            payload["substacks"].push(subobj);
        }

        payload["colors"] = this.loadColors(colorrange, comptype);
        payload["element"] = '#stack_roi';
        payload["modal"] = true;
        payload["metadataTop"] = true;
        payload["colorInterpolate"] = ['White', 'Yellow', 'aquamarine', 'deepskyblue', 'mediumorchid'];


        var cwidth = $("#stack_roi").width(); 
        payload["canvasDimenstions"] = [cwidth, cwidth];

        if (this.state.viewer != null) {
            this.state.viewer.destroy();
        }
        var s = new StackViewerLib(payload);
        this.setState({viewer: s});
        s.init();
        var stackviewer_el = $('#stack_roi')[0]
        stackviewer_el.addEventListener('mouseup', this.addNavButton, false)
        payload["stackMidpoint"] = new Float32Array([minx + (maxx-minx)/2,miny + (maxy-miny)/2,minz + (maxz-minz)/2]);
        this.props.updateStackData(payload);
    },
    addNavButton: function (event){
        //event handler registered to the stack_roi element. Adds the neuroglancer
        //navigation button to the modal if it's open
        var modalOpen = !!$('#stack3d_stats_modal')[0]
        var btnAdded = !!$('#nav_Neurog_btn')[0]
        if(modalOpen && !btnAdded){
            var modal_body_el = $('#stack3d_stats_modal .modal-footer')[0]

            var button_dom = (
               <button type="button" className="btn btn-primary" onClick={this.handleNeurogNav}>
                    View Location in Neuroglancer
               </button>
            );
            ReactDOM.render(button_dom, modal_body_el);
        }
    },
    handleNeurogNav: function(event){

        $('#stack3d_stats_modal').modal('hide')

        //get xyz coordinates from the modal dom
        var stack_info_divs = $('#stack3d_stats_modal .modal-body')[0].childNodes
        var coords = new Float32Array(3);
        var key, val;
        for(var i=0; i<stack_info_divs.length; i++){
            [key, val] = stack_info_divs[i].innerHTML.split(':')
            if(key === "x"){
                coords[0] = parseInt(val);
            }
            else if(key === "y"){
                coords[1] = parseInt(val);
            }
            else if(key === "z"){
                coords[2] = parseInt(val);
            }
        }

        this.props.updateNeurogPos(new Float32Array(coords))
    },
    componentWillReceiveProps: function (nextprops) {
        //stop and start animation to improve perf when view switches to neuroglancer tab
        if(this.props.active != nextprops.active){
            //visibility of the tab changed
            if(nextprops.active){
                this.state.viewer.animate()
            }
            else{
                cancelAnimationFrame(this.state.viewer.animationFrame);// Stop the animation
            }
        }
        //only update the substacks when this panel is active
        if(nextprops.substacks != this.props.substacks || nextprops.comptype != this.props.comptype){
            //metrics changed
            this.stacksNeedUpdate = true;
        }
        if(nextprops.active && this.stacksNeedUpdate){//update
            this.stacksNeedUpdate = false;
            this.loadSubstacks(nextprops.substacks, nextprops.comptype);
        }
    },
    componentDidMount: function () {
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    componentWillUnmount: function () {
        if (this.state.viewer != null) {
            this.state.viewer.destroy();
        }
    },
    useStat : function (metric) {
        this.setState({metric: metric}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    downloadScreenshot: function () {
        if (this.state.viewer) {
            this.state.viewer.screenshot();
        }
    },

    render: function () {

        // find all metric types for this comparison type
        var typename = this.props.comptype;
        var metrictypes = []
        for (var sid in this.props.substacks) {
            var substackmetrics = this.props.substacks[sid];
            // assume all substacks have the same stats
            for (var mid = 0; mid < substackmetrics.length; mid++) {
                var metricdata = substackmetrics[mid];
                if ("display" in metricdata) {
                    if (!metricdata["display"]) {
                        continue;
                    }
                }
                if (metricdata["name"] === "bbox") {
                    continue;
                }
                if (metricdata["typename"] != typename) {
                    continue;
                }
                metrictypes.push(metricdata["name"]);
            }
            break; 
        }

                /*for (var metric in metrictypes) {
                    if (this.state.metric === metric) {
                        <button type="button" className={"btn btn-default active"} onClick={this.useStat(metric)}>{metric}</button>
                    } else {
                        <button type="button" className={"btn btn-default"} onClick={this.useStat(metric)}>{metric}</button>
                    }
                }*/

        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                Subvolume Stats -- {typename}
                <button type="button" className="btn btn-default pull-right" onClick={this.downloadScreenshot}>
                <span className="glyphicon glyphicon-download-alt" aria-hidden="true" ></span>
                </button>
                </div>

                <div className="panel-body row">
                <div className="btn-group" role="group" aria-label="metricsel">
                {metrictypes.map(function(metric, i) {
                    if (this.state.metric === metric) {
                        return (<button type="button" className={"btn btn-default active"} onClick={() => this.useStat(metric)}>{metric}</button>);
                    } else {
                        return (<button type="button" className={"btn btn-default"} onClick={() => this.useStat(metric)}>{metric}</button>);
                    }
                }, this)}
                </div>
                <div className="panel-body" id="stack_roi"></div>
                </div>
            </div>
        );
        
    }
});

var StackViewerState = function(state){
    return {
        active: (state.main.ActiveTab==1 ? true : false),
        stackData: state.main.stackData
    }
};

var StackViewerDispatch = function(dispatch){
    return {
        updateNeurogPos: function(position) {
            dispatch({
                type: 'UPDATE_POSITION',
                position: position
            });
        },
        updateStackData: function(stackData){
            dispatch({
                type: 'UPDATE_STACK_DATA',
                stackData: stackData
            });
        }
    }
};

StackViewer = connect(StackViewerState, StackViewerDispatch)(StackViewer)

module.exports = StackViewer;
