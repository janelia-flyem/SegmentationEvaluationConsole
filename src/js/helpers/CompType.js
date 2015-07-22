"use strict";

var CompType = function (compstr) {
    this.typeName = "voxels"; 
    this.instanceName = "voxels"; 
    if (compstr) {
        this.typeName = compstr.split(':')[0];
        this.instanceName = compstr.split(':')[1];
    }
    
    this.toString = function () {
        var name = this.instanceName;
        if (this.typeName != "voxels") {
            name += " (" + this.typeName + ")";
        } 
        return name;
    };

    this.toKey = function () {
        return this.typeName + ":" + this.instanceName;
    };

    // ?! needs to be added to file
    this.isSparse = function () {
        return false;
    }
}; 

module.exports = CompType;
