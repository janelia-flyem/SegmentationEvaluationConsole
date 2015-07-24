"use strict";

var React = require('react');
var OverlayTrigger  = require('react-bootstrap/lib/OverlayTrigger');
var Popover = require('react-bootstrap/lib/Popover');

var TableRow = React.createClass({
    render: function () {
        return (
            <tr>
                <OverlayTrigger trigger='click' placement='top' rootClose={true} overlay={<Popover title={this.props.rowinfo[0]}>{this.props.rowinfo[2]} </Popover>}>            
                <td>{this.props.rowinfo[0]}</td>
                </OverlayTrigger>

                <td>{this.props.rowinfo[1]}</td>

            </tr>
        );
    }
});

var TableInt = React.createClass({
    render: function () {
        var globalcnt = 0
        var count = this.props.tableinfo.length 
        return (
                <table className="table table-responsive table-condensed table-responsive">
                   <thead> <tr><th><b>Stat</b></th><th><b>Value</b></th></tr> </thead>
                   <tbody> 
                   {this.props.tableinfo.map(function(val) {
                        globalcnt += 1
                        return <TableRow key={"maintable-"+String(globalcnt)} rowinfo={val} />
                    })}
                    </tbody>  
                </table>
        );
    }
});


var MainTable = React.createClass({
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
        return (
            <div className="panel panel-info">
                <div className="panel-heading"> Summary Stats -- {typename}</div>
                <div className="panel-body stats" >
                    <TableInt tableinfo={master_list} /> 
                </div>
            </div>
        );
    }
});

module.exports = MainTable;
