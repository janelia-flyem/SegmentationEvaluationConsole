"use strict";

var React = require('react');
var OverlayTrigger  = require('react-bootstrap/lib/OverlayTrigger');
var Popover = require('react-bootstrap/lib/Popover');
var RetrieveExp2 = require('./RetrieveExp2.react.js');
var JobInfo = require('./JobInfo.react.js');

var CompInfo = React.createClass({
    writeConfig: function () {
        var config = this.props.metric_data.getConfig();
        
        // write main options out
        var output = "<p>";
        for (var element in config["dvid-info"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["dvid-info"][element]) + "<br>");
        }

        // write test seg config
        output += "<br><i>Test Seg Config</i><br>";
        for (var element in config["dvid-info-comp"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["dvid-info-comp"][element]) + "<br>");
        }

        // write options
        output += "<br><i>Options</i><br>";
        for (var element in config["options"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["options"][element]) + "<br>");
        }

        output += "</p>";
        return output;
    },
    componentDidMount: function () {
        $('[data-toggle="popover"]').popover();
    },
    render: function () {
        var configfile = this.props.metric_data.getConfig();
        var expname = configfile["dvid-info"]["stats-location"];
        var configdata = this.writeConfig();

        return (
            <div >
                <h5>2nd Comparison: {expname}</h5>
                <a type="button" className="btn btn-default" data-toggle="popover" data-html="true" tabIndex="4"
                data-trigger="focus" title="Comparison Configuration" data-content={configdata} role="button">
                <span className="glyphicon glyphicon-info-sign" aria-hidden="true" ></span>
                </a>
            </div>
        );
    }
});


var TableRow = React.createClass({
    render: function () {
        var comptd = <td />
        var highlight = "";
        if (this.props.compinfo) {
            comptd = <td>{this.props.compinfo}</td>;
            if (this.props.compinfo[1]) {
                highlight = "danger";
            }
        }

        return (
            <tr className={highlight}>
                <OverlayTrigger trigger='click' placement='top' rootClose={true} overlay={<Popover title={this.props.rowinfo[0]}>{this.props.rowinfo[2]} </Popover>}>            
                <td>{this.props.rowinfo[0]}</td>
                </OverlayTrigger>

                <td>{this.props.rowinfo[1]}</td>

                {comptd}
            </tr>
        );
    }
});

var TableInt = React.createClass({
    render: function () {
        var globalcnt = 0
        
        if (this.props.tableinfo.length == this.props.compinfo.length) {
            return (
                <table className="table table-responsive table-condensed table-responsive table-striped">
                <thead> <tr>
                <th><b>Stat</b></th>
                <th><b>Val</b></th>
                <th><b>Comp Val</b></th>
                </tr> </thead>
                <tbody> 
                {this.props.tableinfo.map(function(val) {
                    globalcnt += 1;
                    return <TableRow key={"maintable-"+String(globalcnt)} compinfo={this.props.compinfo[globalcnt-1]} rowinfo={val} />
                    }.bind(this))}
                </tbody>  
                </table>
            );
        } else { 
            return (
                <table className="table table-responsive table-condensed table-responsive table-striped">
                <thead> <tr><th><b>Stat</b></th><th><b>Value</b></th><th></th></tr> </thead>
                <tbody> 
                {this.props.tableinfo.map(function(val) {
                    globalcnt += 1;
                    return <TableRow key={"maintable-"+String(globalcnt)} compinfo={null} rowinfo={val} />
                    })}
                </tbody>  
                </table>
            );
        }
    }
});


var MainTable = React.createClass({
    getInitialState: function () {
        return { metricComp: null };
    },
    updateComp: function (metrics) {
        this.setState({metricComp: metrics}); 
    },
    render: function () { 
        var master_list = [];
        var typename = this.props.comptype.toString();
        var statlist = this.props.metric_data.getAllStats(this.props.comptype);
        for (var i = 0; i < statlist.length; i++) {
            var grp = statlist[i].toStringArr();
            var desc = statlist[i].toDescArr();

            for (var j = 0; j < grp.length; j++) {
                master_list.push([grp[j]["name"], grp[j]["value"], desc[j]]);
            }
        }

        var comparable = true;
        var comp_list = []
        var comp_list2 = []
        var statlistcomp = null;
         
        if (this.state.metricComp) {
            var statlist2 = this.state.metricComp.getAllStats(this.props.comptype);
            statlistcomp = statlist2;
            var tcount = 0;
            for (var i = 0; i < statlist2.length; i++) {
                var grp = statlist2[i].toStringArr();
                var desc = statlist2[i].toDescArr();
                for (var j = 0; j < grp.length; j++) {
                    if (grp[j]["name"] != master_list[tcount][0]) {
                        comparable = false;
                        break;
                    }
                    tcount += 1
                    comp_list2.push(grp[j]["value"]);
                }
                if (!comparable) {
                    false;
                }
            }
        }

        var jobinfo = <div />
        if (comp_list2.length > 0) {
            var tcount = 0;
            for (var i = 0; i < statlist.length; i++) {
                var comp_array = statlist[i].worseThan(statlistcomp[i]);
                for (var j = 0; j < comp_array.length; j++) {
                    comp_list.push([comp_list2[tcount], comp_array[j]]);
                    tcount += 1
                }
            }

            jobinfo =  <CompInfo metric_data={this.state.metricComp} />;
        } 


        var comparable = <div />
        if (!comparable) {
            comparable = <div>Experiment not comparable</div>
        }

        return (
            <div className="panel panel-info">
                <div className="panel-heading"> Summary Stats -- {typename}</div>
                <div className="panel-body stats" >
                    <RetrieveExp2 callback={this.updateComp} />

                    {jobinfo}
                    {comparable}
                    <TableInt tableinfo={master_list} compinfo={comp_list}/> 
                </div>
            </div>
        );
    }
});

module.exports = MainTable;
