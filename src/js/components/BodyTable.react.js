"use strict";

var React = require('react');

var BodyTable = React.createClass({
    render: function () {
        var typename = this.props.comptype.split(':')[1];
            return (
                <div className="panel panel-info">
                    <div className="panel-heading"> Body Stats ({typename})</div>
                    <div className="panel-body">
                        <table className="table table-striped table-condensed table-responsive">
                            <tr><td><b>Stat</b></td><td><b>Value</b></td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                            <tr><td>stat</td><td>value</td></tr>
                        </table>
                    </div>
                </div>
            );
    }
});

module.exports = BodyTable;
