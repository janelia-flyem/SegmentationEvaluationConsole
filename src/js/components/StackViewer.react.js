"use strict"

var React = require('react');
var StackViewerLib = require('stack3d');

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
                // ?! compute real fscore instead of average
                total = (fmerge + fsplit) / 2;
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
        var output_str = "<br>"
        for (var stat in substack["types"][comptype]) {
             output_str += ("&nbsp&nbsp<b>" + stat + "</b>: " + JSON.stringify(substack["types"][this.props.comptype][stat]) + "<br>");
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
            //subobj["annotations"] = this.getROIStats(substacks[sid]);
            subobj["annotations"] = this.getROIStats(substacks[sid], comptype);

            // !! hacks into proofreader status for now
            var valstat = this.getStat(substacks[sid], comptype);
            var statusval = 0;
            if (colorrange[2] > 0.000001) {
                statusval = Math.floor((valstat - colorrange[0])/colorrange[2]);
            }
            if (this.state.metric == "rand") {
                statusval = NumColors - statusval;
            }
            if (statusval == NumColors) {
                statusval -= 1;
            }

            subobj["status"] = statusval;
            payload["substacks"].push(subobj);
        }

        payload["colors"] = this.loadColors(colorrange, comptype);
	payload["element"] = '#stack_roi';
        payload["modal"] = true;

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
    },
    componentWillReceiveProps: function (nextprops) {
        this.loadSubstacks(nextprops.substacks, nextprops.comptype);
    },
    componentDidMount: function () {
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    useVI : function () {
        this.setState({metric: "VI"});
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    useRand : function () {
        this.setState({metric: "rand"});
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    useCombined : function () {
        this.setState({fmergefsplit: "both"});
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    useFmerge : function () {
        this.setState({fmergefsplit: "fmerge"});
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    useFsplit : function () {
        this.setState({fmergefsplit: "fsplit"});
        this.loadSubstacks(this.props.substacks, this.props.comptype);
    },
    render: function () {
        var typename = this.props.comptype;

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
                <div className="panel-heading">Subvolume Stats -- {typename}</div>
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

module.exports = StackViewer;
