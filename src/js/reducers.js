"use strict";
var React = require("react")
var CompType = require('./helpers/CompType');

var initialState = {
    ViewHelp: false,
    compType: new CompType(),
    metric_results: null,
    ActiveTab: 1,
    position: null
}

var ConsoleReducers = function(state, action){
    if(state === undefined){
        return initialState
    }

    switch(action.type){
        case 'TOGGLE_HELP':{
            return Object.assign({}, state, {
                ViewHelp: !state.ViewHelp,
            });
        }
        case 'LOAD_DATA':{
            return Object.assign({}, state, {
                metric_results: action.data,
            });
        }
       case 'HANDLE_TYPE':{
            return Object.assign({}, state, {
                compType: action.data,
            });
        }
        case 'CHANGE_TAB':{
            return Object.assign({}, state, {
                ActiveTab: action.tabnum
            });
        }
        case 'UPDATE_POSITION':{
            return Object.assign({}, state, {
                ActiveTab: 2,
                position: action.position
            });
        }

    }


}

//export default

module.exports = ConsoleReducers;
