"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
exports.state = {
    mod_novis: null,
    mod_novis_capacity: 0,
    mod_decompressed: null,
    mod_decompressed_capacity: 0
};
exports.noVisPVS = (model) => {
    const pvsbytes = (model.numleafs + 7) >> 3;
    if (exports.state.mod_novis === null || pvsbytes > exports.state.mod_novis_capacity) {
        exports.state.mod_novis_capacity = pvsbytes;
        exports.state.mod_novis = new Uint8Array(new ArrayBuffer(exports.state.mod_novis_capacity));
        exports.state.mod_novis.fill(0xFF);
    }
    return exports.state.mod_novis;
};
exports.leafPVS = (leaf, model) => {
    if (leaf == model.leafs)
        return exports.noVisPVS(model);
    return decompressVis(leaf.compressed_vis, model);
};
/*
===================
Mod_DecompressVis
===================
*/
const decompressVis = (visData, model) => {
    const row = (model.numleafs + 7) >> 3;
    if (exports.state.mod_decompressed === null || row > exports.state.mod_decompressed_capacity) {
        exports.state.mod_decompressed_capacity = row;
        exports.state.mod_decompressed = exports.state.mod_decompressed
            ? new Uint8Array(common_1.bufferGrow(exports.state.mod_decompressed.buffer, row))
            : new Uint8Array(new ArrayBuffer(exports.state.mod_decompressed_capacity));
    }
    if (!visData) {
        // no vis info, keep all visible
        exports.state.mod_decompressed.fill(0xFF);
        return exports.state.mod_decompressed;
    }
    var visCounter = 0;
    var outCounter = 0;
    do {
        if (visData[visCounter]) {
            exports.state.mod_decompressed[outCounter++] = visData[visCounter++];
            continue;
        }
        var c = visData[visCounter + 1];
        visCounter += 2;
        while (c) {
            if (outCounter === row) {
                if (!model.viswarn) {
                    model.viswarn = true;
                    console.log("Mod_DecompressVis: output overrun on model \"%s\"\n", model.name);
                }
                return exports.state.mod_decompressed;
            }
            exports.state.mod_decompressed[outCounter++] = 0;
            c--;
        }
    } while (outCounter < row);
    return exports.state.mod_decompressed;
};
/*
=================
Mod_CalcSurfaceBounds -- johnfitz -- calculate bounding box for per-surface frustum culling
=================
*/
exports.calcSurfaceBounds = (model, surf) => {
    // int			i, e;
    // mvertex_t	*v;
    surf.mins[0] = surf.mins[1] = surf.mins[2] = 9999;
    surf.maxs[0] = surf.maxs[1] = surf.maxs[2] = -9999;
    for (var i = 0; i < surf.numedges; i++) {
        var v, e = model.surfedges[surf.firstedge + i];
        if (e >= 0)
            v = model.vertexes[model.edges[e][0]];
        else
            v = model.vertexes[model.edges[-e][1]];
        if (surf.mins[0] > v[0])
            surf.mins[0] = v[0];
        if (surf.mins[1] > v[1])
            surf.mins[1] = v[1];
        if (surf.mins[2] > v[2])
            surf.mins[2] = v[2];
        if (surf.maxs[0] < v[0])
            surf.maxs[0] = v[0];
        if (surf.maxs[1] < v[1])
            surf.maxs[1] = v[1];
        if (surf.maxs[2] < v[2])
            surf.maxs[2] = v[2];
    }
};
//# sourceMappingURL=model.js.map