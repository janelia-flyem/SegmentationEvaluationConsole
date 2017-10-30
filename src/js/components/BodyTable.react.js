"use strict";

var React = require('react');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

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


var TableRowComp = React.createClass({
    render: function () {
        return (
            <tr>
                <td>
                    <a onClick={this.handleClick}>{this.props.rowinfo[0][0]}</a>
                </td>
                <td>{this.props.rowinfo[0][1]}</td>
            </tr>
        );
    },
    getOverlapBodyType: function(BodyTableType){
        //get the comparison type for each segmentation type
        if(BodyTableType === 'GT'){
            return 'Test';
        }
        if(BodyTableType === 'Test'){
            return 'Ground Truth';
        }
        return BodyTableType;
    },  
    handleClick: function(){
        this.props.loadBodyModal(this.props.rowinfo[0][0],
                                 this.props.rowinfo[1], 
                                 this.getOverlapBodyType(this.props.rowinfo[0][3]),
                                 this.props.rowinfo[0][2]);
    }
});
var TableRowState = function(state){
    return {};
};

var TableRowDispatch = function(dispatch){
    return {
        loadBodyModal: function(bodyID, debugInfo, overlapSegmentationType, statName) {
            dispatch({
                type: 'LOAD_BODY_MODAL',
                debugInfo: debugInfo,
                overlapSegmentationType: overlapSegmentationType,
                modalSelectedBodyID: bodyID,
                statName: statName,
            });
        }
    }
};

var TableRow = connect(TableRowState, TableRowDispatch)(TableRowComp)

var TableInt = React.createClass({
    render: function () {
        var globalcnt = 0
        var tablelimit = 100;

        if (this.props.tableinfo.length < tablelimit) {
            tablelimit = this.props.tableinfo.length;
        }
        return (
                <table className="table table-responsive table-condensed table-responsive table-striped">
                   <thead> <tr><th><b>Body ID</b></th><th><b>Value</b></th></tr> </thead>
                   <tbody> 
                   {this.props.tableinfo.slice(0,tablelimit).map(function(val) {
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
            var typename = this.props.comptype.toString();
            var bodymodes = this.props.metric_data.getBodyStatTypes(this.props.comptype.toKey());

            // see if mode is valid
            var bodystat = this.state.curr_value;
            var found = false;
            for (var i = 0; i < bodymodes.length; i++) {
                if (bodymodes[i] === bodystat) {
                    found = true;
                }
            }
            if (!found) {
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
