"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pallete_1 = require("./pallete");
const textures_1 = require("./textures");
const asset_1 = require("../helpers/asset");
const modelLoader_1 = require("./modelLoader");
const entities_1 = require("./entities");
const fog_1 = require("./fog");
const mapAlpha_1 = require("./mapAlpha");
const novis = Array.from({ length: 1024 }, () => 0xff);
const decompressVis = (i, model) => {
    var decompressed = [], c, out = 0, row = (model.numleafs + 7) >> 3;
    if (model.visdata == null) {
        for (; row >= 0; --row)
            decompressed[out++] = 0xff;
        return decompressed;
    }
    for (out = 0; out < row;) {
        if (model.visdata[i] !== 0) {
            decompressed[out++] = model.visdata[i++];
            continue;
        }
        for (c = model.visdata[i + 1]; c > 0; --c)
            decompressed[out++] = 0;
        i += 2;
    }
    return decompressed;
};
exports.model = null;
exports.init = async (gl, bspUrl, paletteUrl) => {
    const pallete = await asset_1.loadBinary(paletteUrl);
    const bsp = await asset_1.loadBinary(bspUrl);
    textures_1.init(gl);
    pallete_1.setPallet(pallete);
    exports.model = modelLoader_1.loadBrushModel(gl, bsp);
    entities_1.init(exports.model);
    fog_1.init(exports.model);
    mapAlpha_1.init(exports.model);
};
exports.pointInLeaf = (p, model) => {
    if (model == null)
        throw new Error('Mod.PointInLeaf: bad model');
    if (model.nodes == null)
        throw new Error('Mod.PointInLeaf: bad model');
    var node = model.nodes[0];
    var normal;
    for (;;) {
        if (node.contents < 0)
            return node;
        normal = node.plane.normal;
        if ((p[0] * normal[0] + p[1] * normal[1] + p[2] * normal[2] - node.plane.dist) > 0)
            node = node.children[0];
        else
            node = node.children[1];
    }
};
exports.leafPVS = function (leaf, model) {
    if (leaf === model.leafs[0])
        return novis;
    return decompressVis(leaf.visofs, model);
};
//# sourceMappingURL=bsp.js.map