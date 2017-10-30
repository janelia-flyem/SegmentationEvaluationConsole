"use strict";

var SummaryMetrics = require("./SummaryMetrics");
var BodyMetrics = require("./BodyMetrics");
var CompType = require("./CompType");

var TestFrag = "Test Frag";
var GTFrag = "GT Frag";
var WorstGT = "Worst GT";
var BestTest = "Best Test";


// TODO distributions -- histograms
// Note: substack mostly handled in StackViewer currently

var SegMetrics = function (jsondata) {
    this.data = jsondata;
    this.comptypes = [];
    this.flatstats = [];

    // let stack viewer handle for now
    this.subvolumes = jsondata.subvolumes;

    // simple copy
    this.config = jsondata["config-file"];
    this.timestamp = jsondata["time-analyzed"];

    var default_comp = new CompType();
    this.comptypes.push(default_comp);

    // load comparison types
    // eventually should have separately ??

    // get types from job info
    for (var i = 0; i < this.data.types.length; i++) {
        var type = this.data.types[i];
        if (type != default_comp.toKey()) {
            this.comptypes.push(new CompType(type));
        }
    }

    // load all stats
    for (var i = 0; i < this.comptypes.length; i++) {
        var type = this.comptypes[i];
        for (var metricType in SummaryMetrics) {
            var fn = eval("SummaryMetrics." + metricType);
            var stats = new fn(this.data, type);
            if (stats.comptype) {
                this.flatstats.push(stats);
            }
        } 
    }
    
    var that = this;
    // functions
    
    // grab info function
    this.getConfig = function () {
        return that.config;
    };

    // grab synapse function
    this.getSynInfo = function () {
        return that.synapse_info.getJSON();
    };

    // grab stats for body type
    this.getBodyStats = function (comptype, statype) {
        // handle any other request
        return BodyMetrics.CustomBodies(that.data, statype, comptype);
    };
    
    // grab comparison types    
    this.getCompTypes = function () {
        return that.comptypes; 
    };

    // get body stat types
    this.getBodyStatTypes = function (comptype) {
        // check for other generic body types
        var metrictypes = [];
        if ("bodystats" in that.data) {
            for (var idx in that.data.bodystats) {
                if (that.data.bodystats[idx].typename === comptype) {
                    metrictypes.push(that.data.bodystats[idx].name);
                }
            }
        }

        return metrictypes;
    }

    // get stat array
    this.getAllStats = function (comptype) {
        if (comptype) {
            var res = []
            for (var i = 0; i < that.flatstats.length; i++) {
                if (that.flatstats[i].comptype.toKey() == comptype.toKey()) {
                    res.push(that.flatstats[i]);
                }
            }
            return res;
        } else {
            return that.flatstats;
        }
    }
};

module.exports = SegMetrics;
