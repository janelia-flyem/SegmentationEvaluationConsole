var React = require('react');
var bootstrap = require('bootstrap');
var CompType = require('../helpers/CompType');

var JobInfo = React.createClass({
    getInitialState: function () {
        return {
            compType: new CompType()
        };
    },
    componentDidMount: function () {
        $('[data-toggle="popover"]').popover();
    },
    changeType: function(ev) {
        var compKey = ev.target.value;
        if (compKey == this.state.compType.toKey()) {
            return;
        }
        var newComp = new CompType(compKey);
        this.props.callback(newComp); 
        this.setState({compType: newComp});
    },
    writeConfig: function () {
        var config = this.props.metric_data.getConfig();
        
        // write main options out
        var output = "<p>";
        for (var element in config["dvid-info"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["dvid-info"][element]) + "<br>");
        }

        if (config.hasOwnProperty("dvid-info-comp")) {
        // write test seg config
            output += "<br><i>Test Seg Config</i><br>";
            for (var element in config["dvid-info-comp"]) {
                output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["dvid-info-comp"][element]) + "<br>");
            }
        }

        // write options
        output += "<br><i>Options</i><br>";
        for (var element in config["options"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(config["options"][element]) + "<br>");
        }

        output += "</p>";
        return output;
    },
    render: function () {
        var config = this.props.metric_data.getConfig();
        var gt_seg = config["dvid-info"]["label-name"];
        var gt_uuid = config["dvid-info"].uuid.slice(0,6);
        var test_seg = "no comparison";
        var seg_uuid = "";

        var infostr = "";
        if (config.hasOwnProperty("dvid-info-comp")) {
            test_seg = config["dvid-info-comp"]["label-name"];
            seg_uuid = config["dvid-info-comp"].uuid.slice(0,6);
            infostr = "GT: " + gt_seg + "#" + gt_uuid + "  Test: " + test_seg + "#" + seg_uuid + "  ";
        } else {
            infostr = "Self-check volume: " + gt_seg + "#" + gt_uuid;
        }

        var comptypes = this.props.metric_data.getCompTypes();

        var seldiv = <div />;

        if (this.props.callback) {
            seldiv = (
                <div className="form-group">
                <select id="compSel" className="form-control" style={{marginLeft: "1em", marginRight: "1em"}} onChange={this.changeType}>
                <option value={comptypes[0].toKey()}>{comptypes[0].toString()}</option>
                {comptypes.slice(1,comptypes.length).map(function (val) {
                                                                            return <option value={val.toKey()}>{val.toString()}</option>;
                                                                        })}   
                </select>
                </div>
            );
        }

        return (
            <form className="navbar-form navbar-right">
                <div className="form-group">
                <label>{infostr}
                </label></div> 
                
                <div className="form-group">
                <a type="button" className="btn btn-default popover-anchor" data-toggle="popover" data-html="true"
                    data-trigger="focus" title="Comparison Configuration" data-content={this.writeConfig()}
                    data-placement="bottom"  role="button" tabIndex="2" style={{marginLeft: "1em"}}>
                    <span className="glyphicon glyphicon-info-sign" aria-hidden="true" ></span>
                </a>
                </div>
                
                {seldiv}

             </form>    
            
        );
    }
});

module.exports = JobInfo;


