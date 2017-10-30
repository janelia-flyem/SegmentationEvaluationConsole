"use strict";

// always want the largest first for the second component
function compare_lists(a, b) {
    return b[0][1] - a[0][1];
}

// list generic body, stat, and description information
function CustomBodies (data, statname, comptype) {
    var arr = [];
    var bodystats = null;

    // find stat
    for (var idx in data.bodystats) {
        if ((data.bodystats[idx].name === statname) && (data.bodystats[idx].typename == comptype.toKey())) {
                bodystats = data.bodystats[idx];    
        }
    }

    if (!bodystats) {
        return arr;
    }

    // find overlap info if it exists
    var overlapinfo = null;
    var tabletype = "Test"; 
    if (bodystats.isgt) {
        var tabletype = "GT";    
        for (var idx in data.bodydebug) {
            if ((data.bodydebug[idx].typename == comptype.toKey()) && (data.bodydebug[idx].name === "gtoverlap")) {
                overlapinfo = data.bodydebug[idx].info;
                break;
            }
        }
    } else {
        for (var idx in data.bodydebug) {
            if ((data.bodydebug[idx].typename == comptype.toKey()) && (data.bodydebug[idx].name === "segoverlap")) {
                overlapinfo = data.bodydebug[idx].info;
                break;
            }
        }
    }

    // populate body data
    var largest2smallest = true;
    if (bodystats) {
        for (var bodyid in bodystats.bodies) {
            var debugbodies = [];
            if (bodyid in overlapinfo) {
                debugbodies = overlapinfo[bodyid];
            }

            // look for auxiliary data
            var auxdata = null;
            if (bodystats.bodies[bodyid].length > 1) {
                auxdata = bodystats.bodies[bodyid][1];
            }
            arr.push([ [bodyid, bodystats.bodies[bodyid][0], statname, tabletype], [ auxdata, debugbodies] ] );
        }
    
        // sort order
        if ("largest2smallest" in bodystats) {
            largest2smallest = bodystats.largest2smallest;
        }
    }

    // sort custom
    if (largest2smallest) {
        return arr.sort(compare_lists);
    } else {
        return arr.reverse(compare_lists);
    }
}
module.exports.CustomBodies = CustomBodies;


