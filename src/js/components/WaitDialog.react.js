"use strict";

var React = require('react');

var WaitDialog = React.createClass({
    getInitialState: function () {
        return {}
    },
    componentDidMount: function () {
        $('#waitdialog').modal({});
    },
    componentWillUnmount: function() {
        $('#waitdialog').modal('hide');
    },
    render: function () {
        return (
                <div className="modal fade" tabIndex="-1" id="waitdialog" data-keyboard="false" data-backdrop="static" role="dialog" aria-labelledby="waitdialog">
                
                <div className="modal-dialog" role="document">
                <div className="modal-content">
                
                <div className="modal-body">
                    <div className="progress">
                    <div className="progress-bar progress-bar-striped active" role="progressbar"
                    aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{width: "100%"}}>
                    Processing...
                    </div>
                </div>
                
                </div>
                
                </div>
                </div>

                </div>
            );
            
    }
});

module.exports = WaitDialog;
