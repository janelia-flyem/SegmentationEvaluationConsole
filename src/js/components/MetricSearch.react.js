"use strict";

var React = require('react');
var dvid = require('dvid');
window.$ = window.jQuery = require('jquery');
var JobInfo = require('./JobInfo.React');
var SegMetrics = require('../helpers/SegMetrics');

var ExpsLocation = "/seg-metrics/";
var APIPrefix = "/api/node/";

var MetricSearch = React.createClass({
    getInitialState: function () {
        return {
            dvid_server: null,
            uuid: null,
            exp_name: null,
            exp_list: [],
            ds_error: false,
            du_error: false,
            metric_results: null
        };
    },
    changeType: function (compType) {
        this.props.typeCallback(compType);
    },
    loadExperiment: function() {
        var value = $("#selectexp option:selected").val();
        
        $.getJSON(this.state.dvid_server + APIPrefix + this.state.uuid + ExpsLocation + "key/" + value,
            function (data) { 
                var metric_data = new SegMetrics(data);
                this.props.callback(metric_data);
                this.setState({metric_results: metric_data})
            }.bind(this) );
    },
    retrieveExpListActual: function(server, uuid) {
        $.ajax({
            url: server + APIPrefix + uuid + ExpsLocation + "keyrange/0/z",
            success: function (data) {
                var explist = []
                for (var i = 0; i < data.length; i++) {
                    var filename = data[i].replace('__', '.');
                    var filearr = filename.split('--');
                    var formatted_name = filearr[0] + " (" + filearr[1] + ") -- " + filearr[2];
                    explist.push([formatted_name, data[i]]);
                }
                
                this.setState({ds_error: false, du_error: false, exp_list: explist});
            }.bind(this),
            error: function (data) {
                this.setState({ds_error: false, du_error: true});
            }.bind(this),
            dataType: "json"
        });
    },
    uploadFile: function(ev) {
        ev.preventDefault();

        var reader = new FileReader();
        reader.onload = function (e) {
            var data = JSON.parse(reader.result);
            var metric_data = new SegMetrics(data);
            this.props.callback(metric_data);
            this.setState({metric_results: metric_data})
        }.bind(this);
        reader.readAsText(ev.target.files[0]);
    },   
    retrieveExpList: function(ev) {
        ev.preventDefault();

        var el_server= React.findDOMNode(this.refs.dvidserver);
        var el_uuid = React.findDOMNode(this.refs.dviduuid);
        var uuid = el_uuid.value;
        var dvidserver = el_server.value;
        if (dvidserver === "") {
            this.setState({ds_error: true});
            return;
        }
        if (uuid === "") {
            this.setState({du_error: true});
            return;
        }
        
        dvidserver = dvidserver.replace("http://", "");
        var serverport = dvidserver.split(':');
        dvidserver = "http://" + dvidserver;
        var server = serverport[0];
        var portnum = 80;
        if (serverport.length > 1) {
            portnum = parseInt(serverport[1]);
        }
        var dvid_connection = dvid.connect({host: server, port: portnum});
           
        dvid_connection.serverInfo({
            callback: function (data) {
                this.setState({dvid_server: dvidserver, uuid: uuid});
                // call list query
                this.retrieveExpListActual(dvidserver, uuid);
            }.bind(this),
            error: function (err) {
                this.setState({ds_error: true, du_error: false});
            }.bind(this)
        });
    },
    render: function () {
        var uuid_err = <div />;
        var server_err = <div />;

        var modalinfo = (
                <div>

                <div className="modal fade" tabIndex="-1" id="dvidQuery" role="dialog" aria-labelledby="dvidQueryTitle">
                <div className="modal-dialog" role="document">
                <div className="modal-content">
                <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">{String.fromCharCode(215)}</span></button>
                <h4 className="modal-title" id="dvidQueryTitle">Load Evaluation Experiment</h4>
                </div>

                <div className="modal-body">
                    <form className="form">
                        <div className="form-group">
                            <label className="sr-only" htmlFor="dvidserver">DVID Server</label>
                            <input type="text" className="form-control" id="dvidserver" ref="dvidserver" placeholder="DVID Server" aria-describedby="servererr" />
                            {server_err}
                        </div>
                        
                        <div className="form-group">
                            <label className="sr-only" htmlFor="dviduuid">DVID UUID</label>
                            <input type="text" className="form-control" id="dviduuid" ref="dviduuid" aria-describedby="uuiderr" placeholder="UUID"/>
                            {uuid_err}
                        </div>
                        
                        <div className="form-group">
                        <button type="submit" className="btn btn-primary" onClick={this.retrieveExpList}>Search</button>
                        </div>
                        
                        <div className="form-group">
                        <select id="selectexp" className="form-control">
                            <option value="default">Choose Experiment</option>;
                            {this.state.exp_list.map(function (val) {
                                return <option key={val[1]} value={val[1]}>{val[0]}</option>;
                            })}   
                        </select>
                        </div>

                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary" data-dismiss="modal"  onClick={this.loadExperiment}>Load Experiment</button>
                </div>
                
                </div>
                </div>
                </div>

                </div>
        );
        
        var jobinfo_component = <div />;

        if (this.state.metric_results !== null) {
            jobinfo_component = (
                <JobInfo callback={this.changeType} metric_data={this.state.metric_results} />
            );
        }

        return (
                <div>
                {modalinfo}
                <form className="navbar-form navbar-right">
                    <div className="form-group">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#dvidQuery" style={{marginRight: "1em"}}>DVID</button>
                    </div>
                    <div className="form-group">
                        <label className="btn btn-primary" onChange={this.uploadFile} htmlFor="choosefile">
                            <input id="choosefile" type="file" style={{display:"none"}} />
                            File
                        </label>
                    </div>
                </form>
                {jobinfo_component}
                </div>
        ); 

    } 
});


module.exports = MetricSearch;
