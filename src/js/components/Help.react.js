var React = require('react');
var bootstrap = require('bootstrap');

var Help = React.createClass({
    render: function () {
        var helpContent = '<p>General documentation and installation information can be found on the github <a href="https://github.com/janelia-flyem/SegmentationEvaluationConsole">README</a>.</p>';
            helpContent += '<p>A user guide is available on the corresponding <a href="https://github.com/janelia-flyem/SegmentationEvaluationConsole/wiki">wiki</a>.</p>';

        return (
            <a id='help-popover' className="navbar-brand popover-anchor" data-toggle="popover" data-trigger="focus"
                data-html="true" data-placement="bottom"  role="button" tabIndex="1"
                title="Help" data-content={helpContent} >
                <span className="glyphicon glyphicon-question-sign" aria-hidden="true" ></span>
            </a>
        );
    },
    componentDidMount: function () {
        $('#help-popover').popover();
    },
});

module.exports = Help;
