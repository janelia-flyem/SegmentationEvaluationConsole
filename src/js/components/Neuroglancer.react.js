"use strict";

var React = require('react');

var NeuroglancerTab = React.createClass({
    render: function () {
        return (
            <div className="container-fluid">
               <div className="row">
                   <div className='col-md-12'>
                        <div className="neurog-body">
                            <div id="container"></div>
                        </div>
                   </div>
              </div>
            </div>


        );
    },
    componentDidUpdate: function(){
        //make the viewer think it's resizing so that height/width
        //will be set to nonzero size and layers can load
        window.viewer.display.onResize()
    },
    componentDidMount: function(){
        var body = $('body')
        body.append('<script src="neuroglancer/main.bundle.js"></script>')
    }
});

module.exports = NeuroglancerTab;
