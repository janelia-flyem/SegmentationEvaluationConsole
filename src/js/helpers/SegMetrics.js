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
    this.bodymetrictypes = [WorstGT, BestTest, TestFrag, GTFrag];
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
    for (var type in this.data.types) {
        // should be outside of types but
        // will workaround for now
        if (type == "connection-matrix") {
            continue;
        }
        if (type === "connection-matrix2") {
            continue
        }
        
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
    // grab body size
    this.total_sizes = {};
    for (var i = 0; i < this.comptypes.length; i++) {
        var type = this.comptypes[i];
        var total_size = 0;
        for (var body in this.data.types[type.toKey()]["gt-bodies"]) {
            var item = this.data.types[type.toKey()]["gt-bodies"][body];
            total_size += item[2];
        }
        this.total_sizes[type.toKey()] = total_size;
    }

    // grab synapse info specially
    this.synapse_info = null;

    // ?! should eventually have for different comptypes
    // assume first synapse is the one for now
    for (var i = 0; i < this.comptypes.length; i++) {
        var type = this.comptypes[i];
        var res = new SummaryMetrics.ConnectivityStats(this.data, type);
        if (res.comptype) {
            this.synapse_info = res;
            break;
        }
    }

    var that = this;

    // functions
    
    // grab info function
    this.getConfig = function () {
        return that.config;
    };

    // get size for comptype
    this.getTypeSize = function (comptype) {
        return that.total_sizes[comptype.toKey()];
    };
    
    // grab synapse function
    this.getSynInfo = function () {
        return that.synapse_info.getJSON();
    };

    // grab stats for body type
    this.getBodyStats = function (comptype, statype) {
        if (statype == TestFrag) {
            return BodyMetrics.TestFrag(that.data, comptype);
        }
        if (statype == GTFrag) {
            return BodyMetrics.GTFrag(that.data, comptype);
        }
        if (statype == WorstGT) {
            return BodyMetrics.WorstGT(that.data, comptype);
        }
        if (statype == BestTest) {
            return BodyMetrics.BestTest(that.data, comptype);
        }
    };
    
    // grab comparison types    
    this.getCompTypes = function () {
        return that.comptypes; 
    };

    // get body stat types
    this.getBodyStatTypes = function () {
        return that.bodymetrictypes;
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
