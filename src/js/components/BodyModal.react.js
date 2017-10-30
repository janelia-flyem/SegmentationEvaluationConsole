"use strict";

var React = require('react');
var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');


var BodyModal = React.createClass({
    render: function () {
        var SkeletonBtn = <Button disabled>Loading...</Button>
        if(this.props.skeletonData && this.props.skeletonData.found){
            SkeletonBtn = <Button bsStyle="success" onClick={this.props.showNGSkeleton.bind({}, 
                                                                                            this.props.modalSelectedBodyID, 
                                                                                            this.props.skeletonData.position,
                                                                                            this.props.skeletonData.layer)}>
                            View Skeleton in Neuroglancer
                          </Button>
        }
        else if(this.props.skeletonData && !this.props.skeletonData.found){
            SkeletonBtn = <Button bsStyle="warning" disabled>No skeleton data available</Button>
        }
        else if(!!this.props.modalSelectedBodyID){
            this.requestSkeletonData(this.props.modalSelectedBodyID);
        }

        // add custom content based on the body type selected
        var ModelBody = <Modal.Body>
                            <h5>Skeleton Info</h5>
                            {SkeletonBtn}
                            </Modal.Body>

        // load overlap table
        var overlapDIV = <div />;
        if (this.props.debugInfo && this.props.debugInfo[1].length > 0) {
            var overlapIDs = this.props.debugInfo[1];
            overlapDIV = <div>
                <h5>Overlapping Bodies from {this.props.overlapSegmentationType} Segmentation</h5>
                <ul>
                {overlapIDs.map(function(el){
                return <li key={el[1]}>{el[1]}</li>
                })}
                </ul>
                <h5>Skeleton Info</h5>
                {SkeletonBtn}
                </div>
        }

        var auxInfo = <div />;
        
        // support auxiliary information for certain body stat types
        if (this.props.statName === "GTConn") {
            auxInfo = (<div>
                <ul>
                <li>Total connections: {this.props.debugInfo[0][0]}</li>
                <li>Matches seg body {this.props.debugInfo[0][1]}</li>
                </ul>
            </div>);
        }

        return (
            <Modal show={!!this.props.modalSelectedBodyID} onHide={this.props.disposeModal}>
                <Modal.Header closeButton>
                    <Modal.Title> Details for Body {this.props.modalSelectedBodyID} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {auxInfo}
                {overlapDIV}
                </Modal.Body> 
                <Modal.Footer>
                    <Button onClick={this.props.disposeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },
    requestSkeletonData: function(bodyID, overlapSegmentationType){
        var config = this.props.metric_results.config['dvid-info'];
        var info = config;
        if(overlapSegmentationType === 'Ground Truth'){// this body is in the test segmentation
            var config = this.props.metric_results.config['dvid-info-comp'];
        }
       
        var instance = null; 
        if (this.props.skeletonMap) {
            instance = this.props.skeletonMap.get(config['label-name']);
            if(!instance){
                this.props.loadSkeleton({
                    found: false
                });
                return;
            }
        } else {
            this.props.loadSkeleton({
                found: false
            });
            return;
        }

        var l = instance.split('/');
        instance = l[l.length-1];
        var url = 'http://' + info['dvid-server'] + '/api/node/' + info['uuid'] + '/' + instance + '/key/' + bodyID + '_swc';
        var request = new Request(url, {
            'headers': new Headers({'Content-Type': 'text/plain'}),
            'method': 'get'
        });

        fetch(request)
            .then(function(response){
                if(!response.ok) throw new Error('No skeleton data');
                return response.text();
            })
            .then(function(responseStr){
                //find a point from the swc data
                var lines = responseStr.split('\n')
                                .filter(function(str){return str[0] !== '#'});
                var swc_line = (lines[Math.floor(lines.length/2)]).split(' ');

                this.props.loadSkeleton({
                    found: true,
                    position: new Float32Array([  parseFloat(swc_line[2]),
                                                  parseFloat(swc_line[3]),
                                                  parseFloat(swc_line[4])]),
                    layer: config['label-name']
                });
            }.bind(this))
            .catch(function(err){
                this.props.loadSkeleton({
                    found: false
                });
            }.bind(this));

    }
});

var BodyModalState = function(state){
    return {
        debugInfo: state.bodyModal.debugInfo,
        overlapSegmentationType: state.bodyModal.overlapSegmentationType,
        ngSelectedBodyID: state.bodyModal.ngSelectedBodyID,
        modalSelectedBodyID: state.bodyModal.modalSelectedBodyID,
        statName: state.bodyModal.statName,
        skeletonData: state.bodyModal.skeletonData,
        skeletonMap: state.main.skeletonMap,
        metric_results: state.main.metric_results
    }
};

var BodyModalDispatch = function(dispatch){
    return {
        loadSkeleton: function(data) {
            dispatch({
                type: 'LOAD_SKELETON',
                skeletonData:data
            });
        },
        showNGSkeleton: function(bodyID, position, layer) {
            dispatch({
                type: 'SHOW_NG_SKELETON',
                ngSelectedBodyID: bodyID,
                ngSelectedLayer: layer,
                position: position
            });
        },
        disposeModal: function() {
            dispatch({
                type: 'DISPOSE_BODY_MODAL',
            });
        }
    }
};

BodyModal = connect(BodyModalState, BodyModalDispatch)(BodyModal)

module.exports = BodyModal;
