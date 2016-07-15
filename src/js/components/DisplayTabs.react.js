var React = require('react');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;
var MetricViewer = require('./MetricViewer.react.js');
var Neuroglancer = require('./Neuroglancer.react.js');

var DisplayTabs = React.createClass({
  render() {
    if (this.props.metric_results !== null){
        return (
            <div >
                <ul className="nav nav-tabs">
                  <li role="tab"
                      onClick={this.props.changeTab.bind(this,1)}
                      className={this.props.ActiveTab == 1 ? 'active' : ''}>
                    <a href="#">Metrics</a></li>
                  <li role="tab"
                      onClick={this.props.changeTab.bind(this, 2)}
                      className={this.props.ActiveTab == 2 ? 'active' : ''}>
                    <a href="#">Neuroglancer</a></li>
                </ul>
                <div className="tab-content container-fluid">
                     <div role="tabpanel"
                           className={this.props.ActiveTab == 1 ? 'tab-pane active' : 'tab-pane'}
                           id="metrics-pane">
                        <MetricViewer />
                    </div>
                    <div role="tabpanel"
                        className={this.props.ActiveTab == 2 ? 'tab-pane active' : 'tab-pane'}
                        id="neuroglancer-pane">
                        <Neuroglancer />
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="container-fluid">
                <p className="alert alert-info">Please select 'DVID' or 'File' to load data</p>
            </div>
        );

    }
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