"use strict";

var React = require('react');

var SelectBodyFilter = React.createClass({
    render: function () {
        return (
            <select onChange={this.props.callback} className="form-control">
            <option value={this.props.bodymodes[0]}>{this.props.bodymodes[0]}</option>
            {this.props.bodymodes.slice(1, this.props.bodymodes.length).map(function (val) {
                return <option key={val} value={val}>{val}</option>;
            })} 
            </select>
        );                    
    }
});


var TableRow = React.createClass({
    render: function () {
        return (
            <tr>
                <td>{this.props.rowinfo[0]}</td>
                <td>{this.props.rowinfo[1]}</td>

            </tr>
        );
    }
});

var TableInt = React.createClass({
    render: function () {
        var globalcnt = 0
        return (
                <table className="table table-responsive table-condensed table-responsive">
                   <thead> <tr><th><b>Body ID</b></th><th><b>Value</b></th></tr> </thead>
                   <tbody> 
                   {this.props.tableinfo.map(function(val) {
                        globalcnt += 1
                        return <TableRow key={"bodytable-"+String(globalcnt)} rowinfo={val} />
                    })}
                    </tbody>  
                </table>
        );
    }
});


var BodyTable = React.createClass({
    getInitialState: function () {
        return {
            curr_value: null
        }

    },
    updateBodyStat: function (ev) {
        ev.preventDefault();
        this.setState({curr_value: ev.target.value});
    },
    render: function () {
            var bodymodes = this.props.metric_data.getBodyStatTypes();
            var typename = this.props.comptype.toString();

            var bodystat = this.state.curr_value;
            if (!bodystat) {
                bodystat = bodymodes[0];
            }

            var bodyinfo = this.props.metric_data.getBodyStats (this.props.comptype, bodystat) 

            return (
                <div className="panel panel-info">
                    <div className="panel-heading"> Body Stats -- {typename}</div>
                    <div className="panel-body stats">
                        <SelectBodyFilter callback={this.updateBodyStat} bodymodes={bodymodes} />
                        <TableInt tableinfo={bodyinfo} /> 
                    </div>
                </div>
            );
    }
});

module.exports = BodyTable;
