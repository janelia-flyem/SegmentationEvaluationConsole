"use strict";

var React = require('react');


var MainTable = React.createClass({
    render: function () { 
        var master_list = [];
        var statlist = this.props.metric_data.getAllStats();
        for (var i = 0; i < statlist.length; i++) {
            var name = statlist[i].comptype.toString();
            var grp = statlist[i].toStringArr();

            for (var j = 0; j < grp.length; j++) {
                master_list.push([name, grp[j]["name"], grp[j]["value"]]);
            }
        }
    
        return (
            <div className="panel panel-info">
                <div className="panel-heading">Main Stats</div>
                <div className="panel-body">
                <table className="table table-responsive table-condensed table-responsive">
                    <tr><td><b>Type</b></td><td><b>Stat</b></td><td><b>Value</b></td></tr>
                    
                    {master_list.map(function(val) {
                        return <tr><td>{val[0]}</td><td>{val[1]}</td><td>{val[2]}</td></tr>;
                    })}     

                </table>
                
                </div>
            </div>
        );
    }
});

module.exports = MainTable;
