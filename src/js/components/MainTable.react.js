"use strict";

var React = require('react');

var MainTable = React.createClass({
    render: function () {
            return (
                <div className="panel panel-info">
                    <div className="panel-heading">Main Stats</div>
                    <div className="panel-body">
                    <table className="table table-responsive table-condensed table-responsive">
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
                        </table>
                    
                    </div>
                </div>
            );
    }
});

module.exports = MainTable;
