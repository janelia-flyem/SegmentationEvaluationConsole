"use strict";

var React = require('react');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

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
        var otherSegType = this.getOverlapBodyType(this.props.rowinfo[3]);
        var popover = (
            <Popover id={this.props.rowinfo[0] + 'popover'} title={otherSegType + " Bodies Overlapping " + this.props.rowinfo[0]}>
                <ul>
                    {this.props.rowinfo[2].map(function(el){
                        return <li key={el[1]}>{el[1]}</li>
                    })}
                </ul>
            </Popover>
        );
        return (
            <tr>
                <td>
                    <OverlayTrigger placement="right" overlay={popover}>
                      <a>{this.props.rowinfo[0]}</a>
                    </OverlayTrigger>
                </td>
                <td>{this.props.rowinfo[1]}</td>
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
        return '';
    },
    buildPopupContent: function(overlap_array){
        var content = '<ul>';
        for(var i in overlap_array){
            content += '<li>' + overlap_array[i][1] + '</li>';
        }
        return content + '</ul>';
    },
});

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
