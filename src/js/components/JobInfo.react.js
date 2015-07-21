var React = require('react');
var bootstrap = require('bootstrap');

var JobInfo = React.createClass({
    getInitialState: function () {
        return {
            compType: "voxels"
        };
    },
    componentDidMount: function () {
        $('[data-toggle="popover"]').popover();
    },
    writeConfig: function () {
        // write main options out
        var output = "<p>";
        for (var element in this.props.metric_data["config-file"]["dvid-info"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(this.props.metric_data["config-file"]["dvid-info"][element]) + "<br>");
        }

        // write test seg config
        output += "<br><i>Test Seg Config</i><br>";
        for (var element in this.props.metric_data["config-file"]["dvid-info-comp"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(this.props.metric_data["config-file"]["dvid-info-comp"][element]) + "<br>");
        }

        // write options
        output += "<br><i>Options</i><br>";
        for (var element in this.props.metric_data["config-file"]["options"]) {
            output += ("<b>" + element + "</b>" + ": " + JSON.stringify(this.props.metric_data["config-file"]["options"][element]) + "<br>");
        }

        output += "</p>";
        return output;
    },
    render: function () {
        var gt_seg = this.props.metric_data["config-file"]["dvid-info"]["label-name"];
        var test_seg = this.props.metric_data["config-file"]["dvid-info-comp"]["label-name"];
        var gt_uuid = this.props.metric_data["config-file"]["dvid-info"].uuid.slice(0,6);
        var seg_uuid = this.props.metric_data["config-file"]["dvid-info-comp"].uuid.slice(0,6);

        return (
            <div>
            <p>{gt_seg + "#" + gt_uuid} Test: {test_seg + "#" + seg_uuid + "  "}
            <button type="button" className="btn btn-default" data-toggle="popover" data-html="true" data-trigger="focus" title="Comparison Configuration" data-content={this.writeConfig()}>
            <span className="glyphicon glyphicon-info-sign" aria-hidden="true" ></span>
            </button></p>

            </div>
        );
    }
});

module.exports = JobInfo;


