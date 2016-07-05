"use strict";
var React = require("react")
var CompType = require('./helpers/CompType');

var initialState = {
    ViewHelp: false,
    compType: new CompType(),
    metric_results: null
}

var ConsoleReducers = function(state, action){
    if(state === undefined){
        return initialState
    }

    switch(action.type){
        case 'TOGGLE_HELP':{
            return {
                ViewHelp: !state.ViewHelp,
                compType: state.compType,
                metric_results: state.metric_results
            }
        }
        case 'LOAD_DATA':{
            return {
                ViewHelp: state.ViewHelp,
                compType: state.compType,
                metric_results: action.data,
            }
        }
       case 'HANDLE_TYPE':{
            return {
                ViewHelp: state.ViewHelp,
                compType: action.data,
                metric_results: state.metric_results,
            }
        }

    }


}

//export default

module.exports = ConsoleReducers;
