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
         return {
             fmergefsplit: "both", // fmerge, fsplit, or both
             metric: "VI", // VI or rand
             viewer: null
         };
    },
    getStat : function (substack, comptype) {
        var fmerge = substack["types"][comptype][this.state.metric][0];
        var fsplit = substack["types"][comptype][this.state.metric][1];
        var total = fmerge;
        if (this.state.fmergefsplit === "both") {
            total = fmerge + fsplit;
            if (this.state.metric == "rand") {
                // compute unweighted fscore
                total = (fmerge*fsplit) / (fmerge + fsplit);
            } 
        } else if (this.state.fmergefsplit === "fsplit") {
            total = fsplit;
        }
        return total;
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
        for (var stat in substack["types"][comptype]) {
             if (stat == "VI" || stat == "rand") {
                 var res = substack["types"][comptype][stat];

                 output_str += ("&nbsp&nbsp<b>" + stat + "</b>: " + res[0].toFixed(2) + " (false merge), " + res[1].toFixed(2) + " (false split) <br>");

             } else {
                 output_str += ("&nbsp&nbsp<b>" + stat + "</b>: " + JSON.stringify(substack["types"][comptype][stat]) + "<br>");
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
            if (comptype == "rand") {
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
            
            // load ROI info
            var x1 =substacks[sid]["roi"][0];
            var y1 =substacks[sid]["roi"][1];
            var z1 =substacks[sid]["roi"][2];
            var x2 =substacks[sid]["roi"][3];
            var y2 =substacks[sid]["roi"][4];
            var z2 =substacks[sid]["roi"][5];

            subobj["width"] = x2-x1;
            subobj["length"] = y2-y1;
            subobj["height"] = z2-z1;
            //popup receives substack midpoint
            subobj["x"] = x1 + subobj["width"]/2;
            subobj["y"] = y1 + subobj["length"]/2;
            subobj["z"] = z1 + subobj["height"]/2;

            var volume = subobj["width"]*subobj["height"]*subobj["length"];

            // ignore small volumes
            //if (substacks[sid]["types"]["voxels:voxels"]["size"] < (volume/2)) {
            //    continue;
            //}

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
            
            // !! hacks into annotations for now
            //subobj["annotations"] = this.getROIStats(substacks[sid]);
            subobj["annotations"] = this.getROIStats(substacks[sid], comptype)
            // !! hack footer container into annotations for now as well
            subobj["annotations"] += '<div class="modal-footer"></div>'

            // !! hacks into proofreader status for now
            var valstat = this.getStat(substacks[sid], comptype);
            // var statusval = 0;
            // if (colorrange[2] > 0.000001) {
            //     statusval = Math.floor((valstat - colorrange[0])/colorrange[2]);
            // }
            // if (this.state.metric == "rand") {
            //     statusval = NumColors - statusval;
            // }
            // if (statusval == NumColors) {
            //     statusval -= 1;
            // }

            // subobj["status"] = statusval;
            subobj["status"] = valstat;
            payload["substacks"].push(subobj);
        }

        payload["colors"] = this.loadColors(colorrange, comptype);
        payload["element"] = '#stack_roi';
        payload["modal"] = true;
        payload["metadataTop"] = true;
        payload["colorInterpolate"] = ['White', 'Yellow', 'aquamarine', 'deepskyblue', 'mediumorchid'];


        // make dimensions larger by 2x to zoom out
        payload["stackDimensions"] = [(maxx-minx)*2,(maxy-miny)*2,(maxz-minz)*2];
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

        for(var i=1; i<4; i++){
            coords[i-1] = parseInt(stack_info_divs[i].innerHTML.split(':')[1]);
        }

        this.props.updateNeurogPos(new Float32Array(coords))
    },
    componentWillReceiveProps: function (nextprops) {
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
            this.props.reloadNeuroglancerStackLayer();
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
    useVI : function () {
        this.setState({metric: "VI"}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    useRand : function () {
                  this.setState({metric: "rand"}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    useCombined : function () {
        this.setState({fmergefsplit: "both"}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    useFmerge : function () {
        this.setState({fmergefsplit: "fmerge"}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    useFsplit : function () {
        this.setState({fmergefsplit: "fsplit"}, function() { this.loadSubstacks(this.props.substacks, this.props.comptype)}.bind(this));
    },
    downloadScreenshot: function () {
        if (this.state.viewer) {
            this.state.viewer.screenshot();
        }
    },

    render: function () {
        var typename = this.props.rcomptype.toString();

        // set active buttons
        var randsel = "btn btn-default";
        var visel = "btn btn-default";
        if (this.state.metric == "VI") {
            visel = "btn btn-default active";
        } else {
            randsel = "btn btn-default active";
        }
    
        var fmsel = "btn btn-default";
        var fssel = "btn btn-default";
        var cosel = "btn btn-default";
        if (this.state.fmergefsplit == "both") {
            cosel = "btn btn-default active";
        } else if (this.state.fmergefsplit == "fmerge") {
            fmsel = "btn btn-default active";
        } else {
            fssel = "btn btn-default active";
        }

        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                Subvolume Stats -- {typename}
                <button type="button" className="btn btn-default pull-right" onClick={this.downloadScreenshot}>
                <span className="glyphicon glyphicon-download-alt" aria-hidden="true" ></span>
                </button>
                </div>
               
                <div className="panel-body row">
                    <div className="col-md-6">
                        <div className="btn-group" role="group" aria-label="metricsel">
                            <button type="button" className={visel} onClick={this.useVI}>VI</button>
                            <button type="button" className={randsel} onClick={this.useRand}>rand</button>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="btn-group" role="group" aria-label="decompsel">
                            <button type="button" className={cosel} onClick={this.useCombined}>Combined</button>
                            <button type="button" className={fmsel} onClick={this.useFmerge}>False Merge</button>
                            <button type="button" className={fssel} onClick={this.useFsplit}>False Split</button>
                        </div>
                    </div>
                </div>
                <div className="panel-body" id="stack_roi"></div>
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
