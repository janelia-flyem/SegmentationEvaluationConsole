"use strict";

/* Add plugins for different types of metrics to be computed.
 * They are defined here explicitly and traversed in SegMetrics.
 * A type is specified so that they can be clearly separated
 * by the driver function.  Each plugin must be registered
 * in Segmentrics.
 * 
 * Each metric must have
 * 1. toStringArr (summary of stat -- name,value)
 * 2. worseThan (array of true/false)
 * 3. orignal json reference
*/

// VI
var VIStats = function (data, comptype) {
    if (!("VI" in data["types"][comptype.toKey()])) {
        return null;
    }
    this.payload = data["types"][comptype.toKey()]["VI"];
    this.comptype = comptype;
    this.fmerge = this.payload[0];
    this.fsplit = this.payload[1];
    this.total = this.fmerge + this.fsplit;
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "False Merge VI", value: that.fmerge.toFixed(2)},
            {name: "False Split VI", value: that.fsplit.toFixed(2)},
            {name: "Total VI", value: that.total.toFixed(2)}
        ];
    };

    this.toJSON = function () {
        return that.payload;
    };

    this.worseThan = function(otherstat) {
        return [
            that.fmerge > otherstat.fmerge,
            that.fsplit > otherstat.fsplit,
            that.total > otherstat.total
        ];
    }
};
module.exports.VIStats = VIStats;

// rand
var RandStats = function (data, comptype) {
    if (!("rand" in data["types"][comptype.toKey()])) {
        return null;
    }
    this.payload = data["types"][comptype.toKey()]["rand"];
    this.comptype = comptype;

    this.fmerge = this.payload[0];
    this.fsplit = this.payload[1];
    this.total = (this.fmerge+this.fsplit)/2.0; // just average for now
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "False Merge Rand", value: that.fmerge.toFixed(2)},
            {name: "False Split Rand", value: that.fsplit.toFixed(2)},
            {name: "Rand", value: that.total.toFixed(2)}
        ];
    };

    this.toJSON = function () {
        return that.payload;
    };

    this.worseThan = function(otherstat) {
        return [
            that.fmerge < otherstat.fmerge,
            that.fsplit < otherstat.fsplit,
            that.total < otherstat.total
        ];
    }
};
module.exports.RandStats = RandStats;


// edit distance
var EditStats = function (data, comptype) {
    if (!("edit-distance" in data["types"][comptype.toKey()])) {
        return null;
    }
    this.payload = data["types"][comptype.toKey()]["edit-distance"];
    this.comptype = comptype;

    this.fmerge = this.payload[0];
    this.fsplit = this.payload[1];
    this.total = (this.fmerge+this.fsplit)/2.0; // just average for now
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "Split (1:1)", value: String(that.payload["1"][1])},
            {name: "Merge (1:1)", value: String(that.payload["1"][0])},
            {name: "Edit (5:1)", value: String(that.payload["5"][0] + that.payload["5"][1])},
            {name: "Edit (10:1)", value: String(that.payload["10"][0] + that.payload["10"][1])}
        ];
    };
    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.payload["1"][1] > otherstat.payload["1"][1],
            that.payload["1"][0] > otherstat.payload["1"][0],
            (that.payload["5"][0] + that.payload["5"][1]) > (that.payload["5"][0] + that.payload["5"][1]),
            (that.payload["10"][0] + that.payload["10"][1]) > (that.payload["10"][0] + that.payload["10"][1])
        ];
    }
};
module.exports.EditStats = EditStats;


// connectivity matrix (will be queried directly by connectivity widget)
var ConnectivityStats = function (data, comptype) {
    // just load synapse stats for synapse
    if (comptype.typeName != "synapse") {
        return null; 
    }
    // ?! eventually have matrix for each synapse type
    // !! right now same one duplicated for all
    if (!("connection-matrix" in data["types"])) {
        return null;
    }
    this.comptype = comptype;
    this.payload = data["types"]["connection-matrix"];
    var that = this;

    // 0 thresholds will still be given as long as there as a qualifying
    // comparison type
    this.toStringArr = function () {
        return [
            {name: "False Connections (10)", value: String(that.payload["thresholds"][2][0])},
            {name: "True Connections (10)", value: String(that.payload["thresholds"][2][1])}
        ];
    };

    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.payload[2][0] > otherstat.payload[2][0], // worse if more false
            that.payload[2][1] < otherstat.payload[2][1] // worse if fewer true
        ];
    }
};
module.exports.ConnectivityStats = ConnectivityStats;

// worst fsplit (do percentiles?)
// ?! worst body stats should be consolidated in input
var BodyStats = function (data, comptype) {
    // assume that if this exists everything exists
    if (!("worst-vi" in data["types"][comptype.toKey()])) {
        return null;
    }
    this.comptype = comptype;
    this.payload = {}
    this.payload["worst-vi"] = data["types"][comptype.toKey()]["worst-vi"];
    this.payload["worst-fmerge"] = data["types"][comptype.toKey()]["worst-fmerge"];
    this.payload["worst-fsplit"] = data["types"][comptype.toKey()]["worst-fsplit"];

    this.vi = this.payload["worst-vi"][0];  // GT segmented the worst
    this.fmerge = this.payload["worst-fmerge"][0]; // test frag
    this.fsplit = this.payload["worst-fsplit"][0]; // GT frag

    this.goodoverlap = 0;
    this.goodbody = 0;

    if ("greatest-overlap" in data["types"][comptype.toKey()]) {
        this.payload["greatest-overlap"] = data["types"][comptype.toKey()]["greatest-overlap"];
        this.goodoverlap = this.payload["greatest-overlap"][0]; // the bigger the better
        this.goodbody = this.payload["greatest-overlap"][1]; // the bigger the better
    }
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "Body: Worst GT ("+ that.payload["worst-vi"][1] + ")" , value: that.vi.toFixed(2)},
            {name: "Body: Frag Test ("+ that.payload["worst-fmerge"][1] + ")", value: that.fmerge.toFixed(2)},
            {name: "Body: Frag GT ("+ that.payload["worst-fsplit"][1] + ")", value: that.fsplit.toFixed(2)},
            {name: "Body: Best Seg ("+ that.goodbody + ")", value: String(that.goodoverlap)}
        ];
    };
    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.vi > otherstat.vi,
            that.fmerge > otherstat.fmerge,
            that.fsplit > otherstat.fsplit,
            that.goodoverlap < otherstat.goodoverlap
        ];
    }
};
module.exports.BodyStats = BodyStats;

// VI substack stats
var VISubvolumeStats = function (data, comptype) {
    // assume that if this exists everything exists
    if (!("VI" in data["subvolumes"]["types"][comptype.toKey()])) {
        return null;
    }
    this.comptype = comptype;
    this.payload = data["subvolumes"]["types"][comptype.toKey()]["VI"];

    this.fmergew = this.payload["fmerge-worst"][0]; 
    this.fsplitw = this.payload["fsplit-worst"][0]; 
    this.average = this.payload["average"][0] + this.payload["average"][1]; 
    this.fmergeb = this.payload["fmerge-best"][0]; 
    this.fsplitb = this.payload["fsplit-best"][0]; 
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "Subvolume: Worst VI False Merge ("+ that.payload["fmerge-worst"][1] + ")" , value: that.fmergew.toFixed(2)},
            {name: "Subvolume: Worst VI False Split ("+ that.payload["fsplit-worst"][1] + ")" , value: that.fsplitw.toFixed(2)},
            {name: "Subvolume: Average VI", value: that.average.toFixed(2)},
            {name: "Subvolume: Best VI False Merge ("+ that.payload["fmerge-best"][1] + ")" , value: that.fmergeb.toFixed(2)},
            {name: "Subvolume: Best VI False Merge ("+ that.payload["fmerge-best"][1] + ")" , value: that.fsplitb.toFixed(2)}
        ];
    };
    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.fmergew > otherstat.fmergew,
            that.fsplitw > otherstat.fsplitw,
            that.average > otherstat.average,
            that.fmergeb > otherstat.fmergeb,
            that.fsplitb > otherstat.fsplitb
        ];
    }
};
module.exports.VISubvolumeStats = VISubvolumeStats;

// Rand substack stats
var RandSubvolumeStats = function (data, comptype) {
    // assume that if this exists everything exists
    if (!("rand" in data["subvolumes"]["types"][comptype.toKey()])) {
        return null;
    }
    this.comptype = comptype;
    this.payload = data["subvolumes"]["types"][comptype.toKey()]["rand"];

    this.fmergew = this.payload["fmerge-worst"][0]; 
    this.fsplitw = this.payload["fsplit-worst"][0]; 
    this.average = this.payload["average"][0] + this.payload["average"][1]; 
    this.fmergeb = this.payload["fmerge-best"][0]; 
    this.fsplitb = this.payload["fsplit-best"][0]; 
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "Subvolume: Worst Rand False Merge ("+ that.payload["fmerge-worst"][1] + ")" , value: that.fmergew.toFixed(2)},
            {name: "Subvolume: Worst Rand False Split ("+ that.payload["fsplit-worst"][1] + ")" , value: that.fsplitw.toFixed(2)},
            {name: "Subvolume: Average Rand", value: that.average.toFixed(2)},
            {name: "Subvolume: Best Rand False Merge ("+ that.payload["fmerge-best"][1] + ")" , value: that.fmergeb.toFixed(2)},
            {name: "Subvolume: Best Rand False Merge ("+ that.payload["fmerge-best"][1] + ")" , value: that.fsplitb.toFixed(2)}
        ];
    };
    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.fmergew < otherstat.fmergew,
            that.fsplitw < otherstat.fsplitw,
            that.average < otherstat.average,
            that.fmergeb < otherstat.fmergeb,
            that.fsplitb < otherstat.fsplitb
        ];
    }
};
module.exports.RandSubvolumeStats = RandSubvolumeStats;







