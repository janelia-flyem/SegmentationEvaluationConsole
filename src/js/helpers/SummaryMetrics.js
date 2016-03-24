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
            {name: "FM-VI", value: that.fmerge.toFixed(2)},
            {name: "FS-VI", value: that.fsplit.toFixed(2)},
            {name: "VI", value: that.total.toFixed(2)}
        ];
    };

    this.toDescArr = function () {
        return [
            "False Merge VI",
            "False Split VI",
            "Total VI"
        ]
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
    this.total = (this.fmerge*this.fsplit)/(this.fmerge+this.fsplit); // just average for now
    var that = this;

    this.toStringArr = function () {
        return [
            {name: "FM-RD", value: that.fmerge.toFixed(2)},
            {name: "FS-RD", value: that.fsplit.toFixed(2)},
            {name: "Rand", value: that.total.toFixed(2)}
        ];
    };

    this.toDescArr = function () {
        return [
            "False Merge Rand",
            "False Split Rand",
            "Rand"
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
            {name: "Splits", value: String(that.payload["1"][1])},
            {name: "Merges", value: String(that.payload["1"][0])},
            {name: "Nuis(5:1)", value: String(that.payload["5"][0] + 5*that.payload["5"][1])},
            {name: "Nuis(10:1)", value: String(that.payload["10"][0] + 10*that.payload["10"][1])}
        ];
    };
    this.toDescArr = function () {
        return [
            "# Split Edits (1 split = 1 merge)",
            "# Merge Edits (1 split = 1 merge)",
            "# Total Edits (nuisance) in merger units (1 split = 5 merges)",
            "# Total Edits (nuisance) in merger units (1 split = 10 merges)"
        ];
    };
    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        return [
            that.payload["1"][1] > otherstat.payload["1"][1],
            that.payload["1"][0] > otherstat.payload["1"][0],
            (that.payload["5"][0] + that.payload["5"][1]) > (otherstat.payload["5"][0] + otherstat.payload["5"][1]),
            (that.payload["10"][0] + that.payload["10"][1]) > (otherstat.payload["10"][0] + otherstat.payload["10"][1])
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
        // connectivity information will be empty if no connections
        // were found -- just write 0 to indicate this
        if (that.payload["thresholds"].length > 0) {
            return [
                {name: "F-Conn", value: String(that.payload["thresholds"][2][0])},
                {name: "T-Conn", value: String(that.payload["thresholds"][2][1])}
            ];
        } else {
            return [
                {name: "F-Conn", value: "0"},
                {name: "T-Conn", value: "0"}
            ];

        }
    };

    this.toDescArr = function () {
        return [
            "False Connections (>10)",
            "True Connections (>10)"
        ];
    };


    this.toJSON = function () {
        return that.payload;
    };
    this.worseThan = function(otherstat) {
        if (that.payload["thresholds"].length > 0) {
            return [
                that.payload[2][0] > otherstat.payload[2][0], // worse if more false
                that.payload[2][1] < otherstat.payload[2][1] // worse if fewer true
            ] 

        } else {
            return [
                    false,
                    false    
                ];
        }
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
            {name: "B-WRST-GT-VI" , value: that.vi.toFixed(2)},
            {name: "B-WRST-TST-FR", value: that.fmerge.toFixed(2)},
            {name: "B-WRST-GT-FR", value: that.fsplit.toFixed(2)},
            {name: "B-BST-TST-OV", value: String(that.goodoverlap)}
        ];
    };
    
    this.toDescArr = function () {
        return [
            "Worst body VI.  GT body ID = "+ that.payload["worst-vi"][1],
            "Worst body fragmentation VI.  Test body ID = " + that.payload["worst-fmerge"][1],
            "Worst body fragmentation VI.  GT body ID = " + that.payload["worst-fsplit"][1],
            "Segmentation with greatest (best) correct overlap. Test body ID = " + that.goodbody 
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
            {name: "S-WRST-FM-VI" , value: that.fmergew.toFixed(2)},
            {name: "S-WRST-FS-VI" , value: that.fsplitw.toFixed(2)},
            {name: "S-AVE-VI" , value: that.average.toFixed(2)},
            {name: "S-BST-FM-VI" , value: that.fmergeb.toFixed(2)},
            {name: "S-BST-FS-VI" , value: that.fsplitb.toFixed(2)}
        ];
    };
  
    this.toDescArr = function () {
        return [
            "Worst False Merge VI for a Subvolume. Subvolume=" + that.payload["fmerge-worst"][1],
            "Worst False Split VI for a Subvolume. Subvolume=" + that.payload["fsplit-worst"][1],
            "Average Substack VI",
            "Best False Merge VI for a Subvolume. Subvolume=" + that.payload["fmerge-best"][1],
            "Best False Split VI for a Subvolume. Subvolume=" + that.payload["fsplit-best"][1] 
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
            {name: "S-WRST-FM-RD" , value: that.fmergew.toFixed(2)},
            {name: "S-WRST-FS-RD" , value: that.fsplitw.toFixed(2)},
            {name: "S-AVE-RD", value: that.average.toFixed(2)},
            {name: "S-BST-FM-RD" , value: that.fmergeb.toFixed(2)},
            {name: "S-BST-FS-VI" , value: that.fsplitb.toFixed(2)}
        ];
    };
    this.toDescArr = function () {
        return [
            "Worst False Merge Rand for a Subvolume. Subvolume=" + that.payload["fmerge-worst"][1],
            "Worst False Split Rand for a Subvolume. Subvolume=" + that.payload["fsplit-worst"][1],
            "Average Substack Rand",
            "Best False Merge Rand for a Subvolume. Subvolume=" + that.payload["fmerge-best"][1],
            "Best False Split Rand for a Subvolume. Subvolume=" + that.payload["fsplit-best"][1] 
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







