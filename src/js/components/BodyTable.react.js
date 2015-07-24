"use strict";

var React = require('react');
//var DataGrid = require('react-datagrid')

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




var BodyTable = React.createClass({
    render: function () {
            var bodymodes = this.props.metric_data.getBodyStatTypes();
            var typename = this.props.comptype.toString();

            /*
            var columns = [ {name: "bid", title: "Body ID"},  {name: "val", title: "val"} ];
            var data = [
                { bid: '5', val :'323'}
            ]
                
            return (
                <div className="panel panel-info">
                    <div className="panel-heading"> Body Stats -- {typename}</div>
                    <div className="panel-body stats">
                        <SelectBodyFilter bodymodes={bodymodes} />
                        <DataGrid dataSource={data} columns={columns} />
                    </div>
                </div>
            );*/

            return (
                <div className="panel panel-info">
                    <div className="panel-heading"> Body Stats -- {typename}</div>
                    <div className="panel-body stats">
                        <SelectBodyFilter bodymodes={bodymodes} />
                    </div>
                </div>
            );
    }
});

module.exports = BodyTable;
