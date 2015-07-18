"use strict";

var React = require('react');
window.$ = window.jQuery = require('jquery');

/*
 * Master component that allows a user to select a
 * DVID server and a corresponding segmentation
 * evaluation experiment. 
*/
var Master = React.createClass({
    getInitialState: function () {
        return {
        };

    },
    render: function () {
        return (
                <div className="container">
                    <div className="page-header">
                    <h1>EM Segmentation Evaluation</h1>
                    </div>
                </div>
        );
        // add tabs
    }
});


module.exports = Master;
