"use strict";

var React = require('react');
var dvid = require('dvid');
window.$ = window.jQuery = require('jquery');

var ExpsLocation = "/seg-metrics/";
var APIPrefix = "/api/node/";

var MetricSearch = React.createClass({
    getInitialState: function () {
        return {
            dvid_server: null,
            exp_name: null,
            exp_list: [],
            ds_error: false,
            du_error: false
        };
    },
    retrieveExpListActual: function(server, uuid) {
        alert(server + APIPrefix + uuid + ExpsLocation + "keyrange/0/z");
        
        $.ajax({
            url: server + APIPrefix + uuid + ExpsLocation + "keyrange/0/z",
            success: function (data) {
                alert("bladfsad");
                this.setState({ds_error: false, du_error: false, exp_list: data});
            }.bind(this),
            error: function (data) {
                alert("and 2");
                this.setState({ds_error: false, du_error: true});
            }.bind(this),
            dataType: "json"
        });
    },
    retrieveExpList: function() {
        var el_server= React.findDOMNode(this.refs.dvidserver);
        var el_uuid = React.findDOMNode(this.refs.dviduuid);
        var uuid = el_uuid.value;
        var dvidserver = el_server.value;
        if (dvidserver === "") {
            this.setState({ds_error: true});
            return null;
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
                alert(dvidserver);
                this.setState({dvid_server: dvidserver});
                // call list query
                this.retrieveExpListActual(dvidserver, uuid);
            }.bind(this),
            error: function (err) {
                alert("bad1!");
                this.setState({ds_error: true, du_error: false});
            }.bind(this)
        });

        return null;
    },
    render: function () {
        var uuid_err = <div />;
        var server_err = <div />;
        /* 
        if (this.state.du_error) {
            uuid_err = (
                    <div>
                    <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                    <span id="uuiderr" className="sr-only">(error)</span>
                    </div>
                );
        }
        if (this.state.ds_error) {
            server_err = (
                    <div>
                    <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                    <span id="servererr" className="sr-only">(error)</span>
                    </div>
                );
        }*/


        //<form className="form-inline has-error has-feedback">
        //<label for="dvidserver">DVID Server</label>
        return (
            <div className="container-fluid">
                <form className="form-inline">
                    <div className="form-group">
                        <input type="text" className="form-control" id="dvidserver" ref="dvidserver" placeholder="DVID Server" aria-describedby="servererr" />
                        {server_err}
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" id="dviduuid" ref="dviduuid" aria-describedby="uuiderr" placeholder="UUID"/>
                        {uuid_err}
                    </div>
                    <button type="submit" className="btn btn-default" onClick={this.retrieveExpList}>Load Experiments</button>
                    <select className="form-control" onChange={this.loadExperiment}>
                        <option value="default">Choose Experiment</option>;
                        {this.state.exp_list.map(function (val) {
                            return <option key={val} value={val}>{val}</option>;
                        })}   
                    </select>    
                </form>
            </div>   
        ); 

    } 








});


module.exports = MetricSearch;
