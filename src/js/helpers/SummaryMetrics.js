"use strict";

/* Add plugins for different types of metrics to be computed.
 * They are defined here explicitly and traversed in SegMetrics.
 * A type is specified so that they can be clearly separated
 * by the driver function.  Each plugin must be registered
 * in Segmentrics.
 * 
 * Each metric must have
 * 1. toStringArr (summary of stat -- name,value)
 * 2. Compare (array of comparison values. -1: worse than, 0:equal to, 1: better than)
 * 3. orignal json reference
*/


/*
 * Indicates for a metric if a larger value is "better" or a smaller value.
 * i.e. for VI smaller values are more desirable, while for Rand larger values
 * indicate a better segmentation
 */
var better_score = {
    SMALLER: 'smaller',
    LARGER: 'larger'
}
/*
 * comparison helper functions for metrics.
 * Returns classic comparison values:
 *  1:  better/greater
 *  0:  equal
 * -1:  worse/less than
 */
function Compare(A, B, better_score_val){
    var epsilon = .00001;//Precision level for equals comparison

    if (Math.abs(A - B) < epsilon){
        return 0;
    }
    if(better_score_val === better_score.SMALLER){
        return A < B ? 1 : -1;
    }
    if(better_score_val === better_score.LARGER){
        return A > B ? 1 : -1;
    }
}


// Rand substack stats
var SummaryStats = function (data, comptype) {
    // assume that if this exists everything exists
    if (!("summarystats" in data)) {
        return null;
    }
    this.comptype = comptype;
    this.payload = [];
    var that = this;
   
    // find all stats with equal to comptype 
    var allstats = data["summarystats"];
    for (var statindx in allstats) {
        var stat = allstats[statindx];
        if (comptype.toKey() == stat.typename) {
            this.payload.push(stat);
        }
    } 

    this.toStringArr = function () {
        var allstats = [];
        for (var statindx in that.payload) {
            var stat = that.payload[statindx];
            if (stat["higher-better"]) {
                allstats.push({name: stat.name, value: stat.val, comp_better_scores: better_score.LARGER});
            } else {
                allstats.push({name: stat.name, value: stat.val, comp_better_scores: better_score.SMALLER});
            }
        }
        return allstats; 
    };
    this.toDescArr = function () {
        var alldescs = [];
        for (var statindx in that.payload) {
            var stat = that.payload[statindx];
            alldescs.push(stat.description);
        }
        return alldescs;
    };

    this.toJSON = function () {
        return that.payload;
    };
    this.Compare = function(otherstat) {
        var comp = [];

        for (var statindx in that.payload) {
            var stat = that.payload[statindx];
            var name = stat.name;

            for (var statindx2 in otherstat.payload) {
                var stat2 = otherstat.payload[statindx2];
                if (stat2.name === name) {
                    if (stat["higher-better"]) {
                        comp.push(Compare(stat.val, stat2.val, better_score.LARGER));
                    } else {
                        comp.push(Compare(stat.val, stat2.val, better_score.SMALLER));
                    }
                }
            }

        }
        return comp;
    }
};
module.exports.SummaryStats = SummaryStats;







