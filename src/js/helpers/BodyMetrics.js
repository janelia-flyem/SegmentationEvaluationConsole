"use strict";

// always want the largest first for the second component
function compare_lists(a, b) {
    return b[1] - a[1];
}

// vi frag, max_overlap (0 if <50%), body id 
function TestFrag (data, comptype) {
    var arr = [];
    // grab 1st field
    var bodyinfo = data["types"][comptype.toKey()]["seg-bodies"];
    var overlapinfo = data["types"][comptype.toKey()]["top-overlap-seg"];
    for (var item in bodyinfo) {
        arr.push([ item, bodyinfo[item][0], overlapinfo[item], 'Test']);

    }
    return arr.sort(compare_lists)
}
module.exports.TestFrag = TestFrag;

function BestTest (data, comptype) {
    var arr = [];
    // grab 2nd field
    var bodyinfo = data["types"][comptype.toKey()]["seg-bodies"];
    var overlapinfo = data["types"][comptype.toKey()]["top-overlap-seg"];
    for (var item in bodyinfo) {
        arr.push([ item, bodyinfo[item][1], overlapinfo[item], 'Test']);
    }
    return arr.sort(compare_lists)
}
module.exports.BestTest = BestTest;

// vi frag, vi tot, body id
function GTFrag (data, comptype) {
    var arr = [];
    // grab 1st field
    var bodyinfo = data["types"][comptype.toKey()]["gt-bodies"];
    var overlapinfo = data["types"][comptype.toKey()]["top-overlap-gt"];
    for (var item in bodyinfo) {
        arr.push([ item, bodyinfo[item][0], overlapinfo[item], 'GT']);
    }
    return arr.sort(compare_lists)
}
module.exports.GTFrag = GTFrag;


function WorstGT (data, comptype) {
    var arr = [];
    // grab 2nd field 
    var bodyinfo = data["types"][comptype.toKey()]["gt-bodies"];
    var overlapinfo = data["types"][comptype.toKey()]["top-overlap-gt"];
    for (var item in bodyinfo) {
        arr.push([ item, bodyinfo[item][1], overlapinfo[item], 'GT']);
    }
    return arr.sort(compare_lists)
}
module.exports.WorstGT = WorstGT;
