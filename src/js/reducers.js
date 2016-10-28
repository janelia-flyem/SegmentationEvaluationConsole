"use strict";
var React = require("react")
var CompType = require('./helpers/CompType');
var Redux = require('redux');
var combineReducers = Redux.combineReducers;

var initialState = {
    compType: new CompType(),
    metric_results: null,
    ActiveTab: 1,
    position: null,
    skeletonMap: null,
    stackData: null,
    stacklayerReloadNeeded: false
}

var main = function(state, action){
    if(state === undefined){
        return initialState
    }

    switch(action.type){
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
        case 'SHOW_NG_SKELETON':
        case 'UPDATE_POSITION':{
            return Object.assign({}, state, {
                ActiveTab: 2,
                position: action.position
            });
        }
        case 'UPDATE_SKELETON_SOURCES':{
            return Object.assign({}, state, {
                skeletonMap: action.skeletonMap
            });
        }
        case 'UPDATE_STACK_DATA':{
            return Object.assign({}, state, {
                stackData: action.stackData,
                stacklayerReloadNeeded: true
            });
        }
        case 'RELOAD_STACK_LAYER':{
            return Object.assign({}, state, {
                stacklayerReloadNeeded: action.reloadNeeded
            });   
        }
        default:{
            return state;
        }

    }

}


var initialBodyModalState ={
    overlapIDs: [],
    overlapSegmentationType: null,
    ngSelectedBodyID: null,
    modalSelectedBodyID: null,
    skeletonData: null,
    ngSelectedLayer: null
}
var bodyModal  = function(state, action){
    if(state === undefined){
        return initialBodyModalState
    }
    switch(action.type){
        case 'LOAD_BODY_MODAL':{
            return Object.assign({}, state, {
                overlapIDs: action.overlapIDs,
                overlapSegmentationType: action.overlapSegmentationType,
                modalSelectedBodyID: action.modalSelectedBodyID,
                skeletonData: null
            });
        }
        case 'LOAD_SKELETON':{
            return Object.assign({}, state, {
                skeletonData: action.skeletonData
            });
        }
        case 'SHOW_NG_SKELETON':{
            return Object.assign({}, state, {
                ngSelectedBodyID: action.ngSelectedBodyID,
                ngSelectedLayer: action.ngSelectedLayer,
                ActiveTab: 2
            });
        }
        case 'DISPOSE_BODY_MODAL':{
            return initialBodyModalState;
        }
        default:{
            return state;
        }
    }

}

var ConsoleReducers = combineReducers({
    main,
    bodyModal
});

//export default
module.exports = ConsoleReducers;
