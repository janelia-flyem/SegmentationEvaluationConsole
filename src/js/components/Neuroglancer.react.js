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
    }

});

module.exports = NeuroglancerTab;
