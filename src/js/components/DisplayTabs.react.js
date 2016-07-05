var React = require('react');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;
var Tabs = require('react-bootstrap').Tabs;
var Tab = require('react-bootstrap').Tab;
var MetricViewer = require('./MetricViewer.react.js');
var Neuroglancer = require('./Neuroglancer.react.js');

var DisplayTabs = React.createClass({
  render() {
    return (
      <Tabs activeKey={this.props.ActiveTab} onSelect={this.props.changeTab} id="ViewTabs">
        <Tab eventKey={1} title="Metrics">
            <MetricViewer />
        </Tab>
        <Tab eventKey={2}
            title="Neuroglancer"
             disabled={this.props.metric_results ? false : true}>
            <Neuroglancer />
        </Tab>
      </Tabs>
    );
  }
});

var TabsState = function(state){
    return {
        ActiveTab: state.ActiveTab,
        metric_results: state.metric_results
    }
};

var TabsDispatch = function(dispatch){
    return {
        changeTab: function(tabnum) {
            dispatch({
                type: 'CHANGE_TAB',
                tabnum: tabnum
            });
        }

    }
};

DisplayTabs = connect(TabsState, TabsDispatch)(DisplayTabs)

module.exports = DisplayTabs;