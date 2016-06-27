"use strict";

var React = require('react');

var NeuroglancerTab = React.createClass({
    render: function () {
        return (
                <div className="panel panel-info">
                    <div className="panel-heading"> Neuroglancer </div>
                    <div className="panel-body">
                        <div className="neurog-body">
                            <div id="container"></div>
                        </div>
                    </div>
                </div>

        );
    }

});

module.exports = NeuroglancerTab;
