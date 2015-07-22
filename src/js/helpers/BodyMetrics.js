"use strict";

// always want the largest first for the second component
function compare_lists(a, b) {
    return a[1] > b[1];
}

// vi frag, max_overlap (0 if <50%), body id 
function TestFrag (data, comptype) {
    var arr = [];
    // grab 1st field
    var bodyinfo = data["types"][comptype.getKey()]["seg-bodies"];
    for (var item in bodyinfo) {
        array.push([ item, bodyinfo[item][0] ]);

    }
    return arr.sort(compare_lists)
}
function BestTest (data, comptype) {
    var arr = [];
    // grab 2nd field
    var bodyinfo = data["types"][comptype.getKey()]["seg-bodies"];
    for (var item in bodyinfo) {
        array.push([ item, bodyinfo[item][1] ]);
    }
    return arr.sort(compare_lists)
}

// vi frag, vi tot, body id
function GTFrag (data, comptype) {
    var arr = [];
    // grab 1st field
    var bodyinfo = data["types"][comptype.getKey()]["gt-bodies"];
    for (var item in bodyinfo) {
        array.push([ item, bodyinfo[item][0] ]);
    }
    return arr.sort(compare_lists)
}


function WorstGT (data, comptype) {
    var arr = [];
    // grab 2nd field 
    var bodyinfo = data["types"][comptype.getKey()]["gt-bodies"];
    for (var item in bodyinfo) {
        array.push([ item, bodyinfo[item][1] ]);
    }
    return arr.sort(compare_lists)
}


