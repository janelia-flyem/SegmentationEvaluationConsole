"use strict";

var React = require('react');
var dvid = require('dvid');
window.$ = window.jQuery = require('jquery');
var WaitDialog = require('./WaitDialog.React');
var SegMetrics = require('../helpers/SegMetrics');


var ExpsLocation = "/seg-metrics/";
var APIPrefix = "/api/node/";


var RetrieveExp2 = React.createClass({
    getInitialState: function () {
        return {
            waiting: false
        };
    },
    uploadFile: function(ev) {
        ev.preventDefault();
        this.setState({waiting: true});

        var reader = new FileReader();
        reader.onload = function (e) {
            var data = JSON.parse(reader.result);
            var metric_data = new SegMetrics(data);
            this.props.callback(metric_data);
            this.setState({waiting: false})
        }.bind(this);
        reader.readAsText(ev.target.files[0]);
    },  
    render: function() {
        var wait_component = <div />
        if (this.state.waiting) {
            wait_component = <WaitDialog />
        }
         
        return (
            <div>
            {wait_component}
            <form>
            <div className="form-group">
            <label className="btn btn-primary" onChange={this.uploadFile} htmlFor="choosefileComp">
            <input id="choosefileComp" type="file" style={{display:"none"}} />
            File
            </label>
            </div>
            </form>
            </div>
        );

    }

});

module.exports = RetrieveExp2;
