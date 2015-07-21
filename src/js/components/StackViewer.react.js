"use strict"

var React = require('react');
var StackViewerLib = require('stack3d');

var NumColors = 10; 

var StackViewer = React.createClass({
    getInitialState: function () {
         return {
             fmergefsplit: "both", // fmerge, fsplit, or both
             viewer: null
         };
    },
    getStat : function (substack) {
        var fmerge = substack["types"][this.props.comptype][this.props.metric][0];
        var fsplit = substack["types"][this.props.comptype][this.props.metric][1];
        var total = fmerge;
        if (this.state.fmergefsplit === "both") {
            total = fmerge + fsplit; 
        } else if (this.state.fmergefsplit === "fsplit") {
            total = fsplit;
        }
        return total;
    },
    getColorRange: function(substacks) {
        var minval = 1000000000;
        var maxval = 0;

        for (var sid in substacks) {
            var total = this.getStat(substacks[sid]);
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
    loadColors: function() {
        var colors = {
            0: {"name": "0", "color": "#79C9D8"},
            1: {"name": "1", "color": "#86C2D1"},
            2: {"name": "2", "color": "#93BBCA"},
            3: {"name": "3", "color": "#A0B4C3"},
            4: {"name": "4", "color": "#ADADBC"},
            5: {"name": "5", "color": "#BAA7B5"},
            6: {"name": "6", "color": "#C7A0AE"},
            7: {"name": "7", "color": "#D499A7"},
            8: {"name": "8", "color": "#E192A0"},
            9: {"name": "9", "color": "#EE8C99"}
        };

        return colors;

    },
    loadSubstacks: function(substacks) {
        var payload = {};
        payload["substacks"] = [];
        
        // determine stack dims
        var maxx = 0;
        var minx = 100000000;
        var maxy = 0;
        var miny = 100000000;
        var maxz = 0;
        var minz = 100000000;

        var colorrange = this.getColorRange(substacks);

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
            subobj["x"] = x1;
            subobj["y"] = y1;
            subobj["z"] = z1;

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
            //subobj["annotations"] = ""; // ?! add stats

            // !! hacks into proofreader status for now
            var valstat = this.getStat(substacks[sid]);
            var statusval = 0;
            if (colorrange[2] > 0.000001) {
                statusval = Math.floor((valstat - colorrange[0])/colorrange[2]);
            }
            if (this.props.metric == "rand") {
                statusval = NumColors - statusval;
            }
            if (statusval == NumColors) {
                statusval -= 1;
            }

            subobj["status"] = statusval;
            payload["substacks"].push(subobj);
        }

        payload["colors"] = this.loadColors();
	payload["element"] = '#stack_roi';

        // make dimensions larger by 2x to zoom out
        payload["stackDimensions"] = [(maxx-minx)*2,(maxy-miny)*2,(maxz-minz)*2];
        //payload["canvasDimenstions"] = [300, 300];

        if (this.state.viewer != null) {
            // ?! properly delete previous viewer
            //this.state.viewer.scene = null;
            this.setState({viewer: null}); 
            //$( ".stack_roi" ).empty();
        }
        var s = new StackViewerLib(payload);
        this.setState({viewer: s});
        s.init();
    },
    componentWillReceiveProps: function (nextprops) {
        this.loadSubstacks(nextprops.substacks);
    },
    componentDidMount: function () {
        this.loadSubstacks(this.props.substacks);
    },
    render: function () {
        return (
            <div id="stack_roi"></div>
        );
    }
});

module.exports = StackViewer;
