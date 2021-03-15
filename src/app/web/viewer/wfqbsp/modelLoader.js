"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textures_1 = require("./textures");
const mem_1 = require("../helpers/mem");
const vector_1 = require("./vector");
const common_1 = require("./common");
const model_1 = require("./model");
const defs = require("./defs");
const known = [];
const EFFECTS = {
    brightfield: 1,
    muzzleflash: 2,
    brightlight: 4,
    dimlight: 8
};
const TYPE = {
    brush: 0,
    sprite: 1,
    alias: 2
};
const FLAGS = {
    rocket: 1,
    grenade: 2,
    gib: 4,
    rotate: 8,
    tracer: 16,
    zomgib: 32,
    tracer2: 64,
    tracer3: 128
};
const LUMP = {
    entities: 0,
    planes: 1,
    textures: 2,
    vertexes: 3,
    visibility: 4,
    nodes: 5,
    texinfo: 6,
    faces: 7,
    lighting: 8,
    clipnodes: 9,
    leafs: 10,
    marksurfaces: 11,
    edges: 12,
    surfedges: 13,
    models: 14
};
/*
================
Mod_PolyForUnlitSurface -- johnfitz -- creates polys for unlightmapped surfaces (sky and water)

TODO: merge this into BuildSurfaceDisplayList?
================
*/
const polyForUnlitSurface = (loadmodel, fa) => {
    // vec3_t		verts[64];
    // int			numverts, i, lindex;
    // float		*vec;
    // glpoly_t	*poly;
    var texscale, _vec;
    if (fa.flags & (defs.SURF.drawtub | defs.SURF.drawsky))
        texscale = (1.0 / 128.0); //warp animation repeats every 128
    else
        texscale = (1.0 / 32.0); //to match r_notexture_mip
    fa.polys = {
        next: null,
        numverts: fa.numedges,
        verts: []
    };
    const texinfo = loadmodel.texinfo[fa.texinfo];
    // convert edges back to a normal polygon
    for (var i = 0; i < fa.numedges; i++) {
        var lindex = loadmodel.surfedges[fa.firstedge + i];
        if (lindex > 0)
            _vec = loadmodel.vertexes[loadmodel.edges[lindex][0]];
        else
            _vec = loadmodel.vertexes[loadmodel.edges[-lindex][1]];
        fa.polys.verts[i] = [];
        vector_1.copy(_vec, fa.polys.verts[i]);
        fa.polys.verts[i][3] = vector_1.dotProduct(_vec, texinfo.vecs[0]) * texscale;
        fa.polys.verts[i][4] = vector_1.dotProduct(_vec, texinfo.vecs[1]) * texscale;
    }
};
const findName = function (name) {
    if (name.length === 0)
        throw new Error('Mod.FindName: NULL name');
    var i;
    for (i = 0; i < known.length; ++i) {
        if (known[i] == null)
            continue;
        if (known[i].name === name)
            return known[i];
    }
    for (i = 0; i <= known.length; ++i) {
        if (known[i] != null)
            continue;
        known[i] = { name: name, needload: true };
        return known[i];
    }
};
const loadVertexes = function (loadmodel, buf) {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.vertexes << 3) + 4, true);
    var filelen = view.getUint32((LUMP.vertexes << 3) + 8, true);
    if ((filelen % 12) !== 0)
        throw new Error('Mod.LoadVisibility: funny lump size in ' + loadmodel.name);
    var count = filelen / 12;
    loadmodel.vertexes = [];
    var i;
    for (i = 0; i < count; ++i) {
        loadmodel.vertexes[i] = [view.getFloat32(fileofs, true), view.getFloat32(fileofs + 4, true), view.getFloat32(fileofs + 8, true)];
        fileofs += 12;
    }
};
const loadEdges = function (loadmodel, buf, brushVersion) {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.edges << 3) + 4, true);
    var filelen = view.getUint32((LUMP.edges << 3) + 8, true);
    if ((filelen & 3) !== 0)
        throw new Error('Mod.LoadEdges: funny lump size in ' + loadmodel.name);
    var count = filelen >> 2;
    loadmodel.edges = [];
    var i;
    for (i = 0; i < count; ++i) {
        loadmodel.edges[i] = [view.getUint16(fileofs, true), view.getUint16(fileofs + 2, true)];
        fileofs += 4;
    }
};
const loadSurfedges = function (loadmodel, buf) {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.surfedges << 3) + 4, true);
    var filelen = view.getUint32((LUMP.surfedges << 3) + 8, true);
    var count = filelen >> 2;
    loadmodel.surfedges = [];
    var i;
    for (i = 0; i < count; ++i)
        loadmodel.surfedges[i] = view.getInt32(fileofs + (i << 2), true);
};
const loadTextures = function (gl, loadmodel, buf) {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.textures << 3) + 4, true);
    var filelen = view.getUint32((LUMP.textures << 3) + 8, true);
    loadmodel.textures = [];
    var nummiptex = view.getUint32(fileofs, true);
    var dataofs = fileofs + 4;
    var i, miptexofs, tx, glt;
    for (i = 0; i < nummiptex; ++i) {
        miptexofs = view.getInt32(dataofs, true);
        dataofs += 4;
        if (miptexofs === -1) {
            loadmodel.textures[i] = textures_1.state.notexture_mip;
            continue;
        }
        miptexofs += fileofs;
        tx = {
            name: mem_1.memstr(new Uint8Array(buf, miptexofs, 16)),
            width: view.getUint32(miptexofs + 16, true),
            height: view.getUint32(miptexofs + 20, true),
            texturechains: [null, null]
        };
        if (tx.name.substring(0, 3).toLowerCase() === 'sky') {
            textures_1.loadSky(gl, new Uint8Array(buf, miptexofs + view.getUint32(miptexofs + 24, true), 32768));
            tx.texturenum = textures_1.state.solidskytexture;
            tx.sky = true;
        }
        else {
            glt = textures_1.loadTexture(gl, tx.name, tx.width, tx.height, new Uint8Array(buf, miptexofs + view.getUint32(miptexofs + 24, true), tx.width * tx.height));
            tx.texturenum = glt.texnum;
            if (tx.name.charCodeAt(0) === 42)
                tx.turbulent = true;
        }
        loadmodel.textures[i] = tx;
    }
    var j, tx2, num, name;
    for (i = 0; i < nummiptex; ++i) {
        tx = loadmodel.textures[i];
        if (tx.name.charCodeAt(0) !== 43)
            continue;
        if (tx.name.charCodeAt(1) !== 48)
            continue;
        name = tx.name.substring(2);
        tx.anims = [i];
        tx.alternate_anims = [];
        for (j = 0; j < nummiptex; ++j) {
            tx2 = loadmodel.textures[j];
            if (tx2.name.charCodeAt(0) !== 43)
                continue;
            if (tx2.name.substring(2) !== name)
                continue;
            num = tx2.name.charCodeAt(1);
            if (num === 48)
                continue;
            if ((num >= 49) && (num <= 57)) {
                tx.anims[num - 48] = j;
                tx2.anim_base = i;
                tx2.anim_frame = num - 48;
                continue;
            }
            if (num >= 97)
                num -= 32;
            if ((num >= 65) && (num <= 74)) {
                tx.alternate_anims[num - 65] = j;
                tx2.anim_base = i;
                tx2.anim_frame = num - 65;
                continue;
            }
            throw new Error('Bad animating texture ' + tx.name);
        }
        for (j = 0; j < tx.anims.length; ++j) {
            if (tx.anims[j] == null)
                throw new Error('Missing frame ' + j + ' of ' + tx.name);
        }
        for (j = 0; j < tx.alternate_anims.length; ++j) {
            if (tx.alternate_anims[j] == null)
                throw new Error('Missing frame ' + j + ' of ' + tx.name);
        }
        loadmodel.textures[i] = tx;
    }
    loadmodel.textures[loadmodel.textures.length] = textures_1.state.notexture_mip;
};
const loadLighting = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.lighting << 3) + 4, true);
    var filelen = view.getUint32((LUMP.lighting << 3) + 8, true);
    if (filelen === 0)
        return;
    loadmodel.lightdata = new Uint8Array(new ArrayBuffer(filelen));
    loadmodel.lightdata.set(new Uint8Array(buf, fileofs, filelen));
};
const loadPlanes = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.planes << 3) + 4, true);
    var filelen = view.getUint32((LUMP.planes << 3) + 8, true);
    if ((filelen % 20) !== 0)
        throw new Error('Mod.LoadPlanes: funny lump size in ' + loadmodel.name);
    var count = filelen / 20;
    loadmodel.planes = [];
    var i, out;
    for (i = 0; i < count; ++i) {
        out = {
            normal: [view.getFloat32(fileofs, true), view.getFloat32(fileofs + 4, true), view.getFloat32(fileofs + 8, true)],
            dist: view.getFloat32(fileofs + 12, true),
            type: view.getUint32(fileofs + 16, true),
            signbits: 0
        };
        if (out.normal[0] < 0)
            ++out.signbits;
        if (out.normal[1] < 0)
            out.signbits += 2;
        if (out.normal[2] < 0)
            out.signbits += 4;
        loadmodel.planes[i] = out;
        fileofs += 20;
    }
};
const loadTexinfo = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.texinfo << 3) + 4, true);
    var filelen = view.getUint32((LUMP.texinfo << 3) + 8, true);
    if ((filelen % 40) !== 0)
        throw new Error('Mod.LoadTexinfo: funny lump size in ' + loadmodel.name);
    var count = filelen / 40;
    loadmodel.texinfo = [];
    var i, out;
    for (i = 0; i < count; ++i) {
        out = {
            vecs: [
                [view.getFloat32(fileofs, true), view.getFloat32(fileofs + 4, true), view.getFloat32(fileofs + 8, true), view.getFloat32(fileofs + 12, true)],
                [view.getFloat32(fileofs + 16, true), view.getFloat32(fileofs + 20, true), view.getFloat32(fileofs + 24, true), view.getFloat32(fileofs + 28, true)]
            ],
            texture: view.getUint32(fileofs + 32, true),
            flags: view.getUint32(fileofs + 36, true)
        };
        if (out.texture >= loadmodel.textures.length) {
            out.texture = loadmodel.textures.length - 1;
            out.flags = 0;
        }
        loadmodel.texinfo[i] = out;
        fileofs += 40;
    }
};
const loadFaces = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.faces << 3) + 4, true);
    var filelen = view.getUint32((LUMP.faces << 3) + 8, true);
    if ((filelen % 20) !== 0)
        throw new Error('Mod.LoadFaces: funny lump size in ' + loadmodel.name);
    var count = filelen / 20;
    loadmodel.firstface = 0;
    loadmodel.numfaces = count;
    loadmodel.faces = [];
    var i, styles, out;
    var mins, maxs, j, e, tex, v, val, side;
    for (i = 0; i < count; ++i) {
        styles = new Uint8Array(buf, fileofs + 12, 4);
        out = {
            plane: loadmodel.planes[view.getUint16(fileofs, true)],
            firstedge: view.getUint32(fileofs + 4, true),
            numedges: view.getUint16(fileofs + 8, true),
            texinfo: view.getUint16(fileofs + 10, true),
            styles: [],
            lightofs: view.getInt32(fileofs + 16, true),
            mins: [],
            maxs: []
        };
        for (j = 0; j < 4; j++) {
            if (styles[j] !== 255)
                out.styles[j] = styles[j];
        }
        mins = [999999, 999999];
        maxs = [-99999, -99999];
        tex = loadmodel.texinfo[out.texinfo];
        out.texture = tex.texture;
        out.flags = 0;
        if (view.getUint16(fileofs + 2, true)) // side
            out.flags |= defs.SURF.planeback;
        if (loadmodel.textures[tex.texture].sky) {
            out.flags |= (defs.SURF.drawsky | defs.SURF.drawtiled);
            out.sky = true;
            polyForUnlitSurface(loadmodel, out);
        }
        else if (loadmodel.textures[tex.texture].turbulent) {
            out.flags |= (defs.SURF.drawtub | defs.SURF.drawtiled);
            out.turbulent = true;
            // detect special liquid types
            if (loadmodel.textures[tex.texture].name.substring(0, 5).toLowerCase() === '*lava')
                out.flags |= defs.SURF.drawlava;
            else if (loadmodel.textures[tex.texture].name.substring(0, 6).toLowerCase() === '*slime')
                out.flags |= defs.SURF.drawslime;
            else if (loadmodel.textures[tex.texture].name.substring(0, 5).toLowerCase() === '*tele')
                out.flags |= defs.SURF.drawtele;
            else
                out.flags |= defs.SURF.drawwater;
            polyForUnlitSurface(loadmodel, out);
            // GL_SubdivideSurface (out);
        }
        else if (loadmodel.textures[tex.texture].name[0] === '{') {
            out.flags |= defs.SURF.drawfence;
        }
        else if (tex.flags & defs.TEX.missing) {
            if (out.lightofs < 0) {
                out.flags |= (defs.SURF.notexture | defs.SURF.drawtiled);
                polyForUnlitSurface(loadmodel, out);
            }
            else {
                out.flags |= defs.SURF.notexture;
            }
        }
        for (j = 0; j < out.numedges; ++j) {
            e = loadmodel.surfedges[out.firstedge + j];
            if (e >= 0)
                v = loadmodel.vertexes[loadmodel.edges[e][0]];
            else
                v = loadmodel.vertexes[loadmodel.edges[-e][1]];
            val = vector_1.dotProduct(v, tex.vecs[0]) + tex.vecs[0][3];
            if (val < mins[0])
                mins[0] = val;
            if (val > maxs[0])
                maxs[0] = val;
            val = vector_1.dotProduct(v, tex.vecs[1]) + tex.vecs[1][3];
            if (val < mins[1])
                mins[1] = val;
            if (val > maxs[1])
                maxs[1] = val;
        }
        // calcSurfaceExtents (out);
        model_1.calcSurfaceBounds(loadmodel, out);
        out.texturemins = [Math.floor(mins[0] / 16) * 16, Math.floor(mins[1] / 16) * 16];
        out.extents = [Math.ceil(maxs[0] / 16) * 16 - out.texturemins[0], Math.ceil(maxs[1] / 16) * 16 - out.texturemins[1]];
        if (!(tex.flags & defs.TEX.special) &&
            (out.extents[0] > 2000 || out.extents[1] > 2000))
            throw new Error("Bad surface extents");
        out.cached_light = [];
        loadmodel.faces[i] = out;
        fileofs += 20;
    }
};
const loadMarksurfaces = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.marksurfaces << 3) + 4, true);
    var filelen = view.getUint32((LUMP.marksurfaces << 3) + 8, true);
    var count = filelen >> 1;
    loadmodel.marksurfaces = [];
    var i, j;
    for (i = 0; i < count; ++i) {
        j = view.getUint16(fileofs + (i << 1), true);
        if (j > loadmodel.faces.length)
            throw new Error('Mod.LoadMarksurfaces: bad surface number');
        loadmodel.marksurfaces[i] = j;
    }
};
const loadVisibility = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.visibility << 3) + 4, true);
    var filelen = view.getUint32((LUMP.visibility << 3) + 8, true);
    if (filelen === 0)
        return;
    loadmodel.visdata = new Uint8Array(new ArrayBuffer(filelen));
    loadmodel.visdata.set(new Uint8Array(buf, fileofs, filelen));
};
const loadLeafs = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.leafs << 3) + 4, true);
    var filelen = view.getUint32((LUMP.leafs << 3) + 8, true);
    if ((filelen % 28) !== 0)
        throw new Error('Mod.LoadLeafs: funny lump size in ' + loadmodel.name);
    var count = filelen / 28;
    loadmodel.leafs = [];
    var i, j, out;
    for (i = 0; i < count; ++i) {
        out = {
            num: i,
            contents: view.getInt32(fileofs, true),
            visofs: view.getInt32(fileofs + 4, true),
            mins: [view.getInt16(fileofs + 8, true), view.getInt16(fileofs + 10, true), view.getInt16(fileofs + 12, true)],
            maxs: [view.getInt16(fileofs + 14, true), view.getInt16(fileofs + 16, true), view.getInt16(fileofs + 18, true)],
            firstmarksurface: view.getUint16(fileofs + 20, true),
            nummarksurfaces: view.getUint16(fileofs + 22, true),
            ambient_level: [view.getUint8(fileofs + 24), view.getUint8(fileofs + 25), view.getUint8(fileofs + 26), view.getUint8(fileofs + 27)],
            cmds: [],
            skychain: 0,
            waterchain: 0
        };
        var p = common_1.littleLong(out.visofs);
        if (p === -1)
            out.compressed_vis = null;
        else
            out.compressed_vis = loadmodel.visdata.subarray(p);
        loadmodel.leafs[i] = out;
        fileofs += 28;
    }
};
const setParent = (node, parent) => {
    node.parent = parent;
    if (node.contents < 0)
        return;
    setParent(node.children[0], node);
    setParent(node.children[1], node);
};
const loadNodes = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.nodes << 3) + 4, true);
    var filelen = view.getUint32((LUMP.nodes << 3) + 8, true);
    if ((filelen === 0) || ((filelen % 24) !== 0))
        throw new Error('Mod.LoadNodes: funny lump size in ' + loadmodel.name);
    var count = filelen / 24;
    loadmodel.nodes = [];
    var i, out;
    for (i = 0; i < count; ++i) {
        loadmodel.nodes[i] = {
            num: i,
            contents: 0,
            planenum: view.getUint32(fileofs, true),
            children: [view.getInt16(fileofs + 4, true), view.getInt16(fileofs + 6, true)],
            mins: [view.getInt16(fileofs + 8, true), view.getInt16(fileofs + 10, true), view.getInt16(fileofs + 12, true)],
            maxs: [view.getInt16(fileofs + 14, true), view.getInt16(fileofs + 16, true), view.getInt16(fileofs + 18, true)],
            firstface: view.getUint16(fileofs + 20, true),
            numfaces: view.getUint16(fileofs + 22, true),
            cmds: []
        };
        fileofs += 24;
    }
    for (i = 0; i < count; ++i) {
        out = loadmodel.nodes[i];
        out.plane = loadmodel.planes[out.planenum];
        if (out.children[0] >= 0)
            out.children[0] = loadmodel.nodes[out.children[0]];
        else
            out.children[0] = loadmodel.leafs[-1 - out.children[0]];
        if (out.children[1] >= 0)
            out.children[1] = loadmodel.nodes[out.children[1]];
        else
            out.children[1] = loadmodel.leafs[-1 - out.children[1]];
    }
    setParent(loadmodel.nodes[0], undefined);
};
const loadClipnodes = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.clipnodes << 3) + 4, true);
    var filelen = view.getUint32((LUMP.clipnodes << 3) + 8, true);
    var count = filelen >> 3;
    loadmodel.clipnodes = [];
    loadmodel.hulls = [];
    loadmodel.hulls[1] = {
        clipnodes: loadmodel.clipnodes,
        firstclipnode: 0,
        lastclipnode: count - 1,
        planes: loadmodel.planes,
        clip_mins: [-16.0, -16.0, -24.0],
        clip_maxs: [16.0, 16.0, 32.0]
    };
    loadmodel.hulls[2] = {
        clipnodes: loadmodel.clipnodes,
        firstclipnode: 0,
        lastclipnode: count - 1,
        planes: loadmodel.planes,
        clip_mins: [-32.0, -32.0, -24.0],
        clip_maxs: [32.0, 32.0, 64.0]
    };
    for (var i = 0; i < count; ++i) {
        loadmodel.clipnodes[i] = {
            planenum: view.getUint32(fileofs, true),
            children: [view.getInt16(fileofs + 4, true), view.getInt16(fileofs + 6, true)]
        };
        fileofs += 8;
    }
};
const makeHull0 = (loadmodel) => {
    var node, child, clipnodes = [], i, out;
    var hull = {
        clipnodes: clipnodes,
        lastclipnode: loadmodel.nodes.length - 1,
        planes: loadmodel.planes,
        clip_mins: [0.0, 0.0, 0.0],
        clip_maxs: [0.0, 0.0, 0.0]
    };
    for (i = 0; i < loadmodel.nodes.length; ++i) {
        node = loadmodel.nodes[i];
        out = { planenum: node.planenum, children: [] };
        child = node.children[0];
        out.children[0] = child.contents < 0 ? child.contents : child.num;
        child = node.children[1];
        out.children[1] = child.contents < 0 ? child.contents : child.num;
        clipnodes[i] = out;
    }
    loadmodel.hulls[0] = hull;
};
const loadEntities = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.entities << 3) + 4, true);
    var filelen = view.getUint32((LUMP.entities << 3) + 8, true);
    loadmodel.entities = mem_1.memstr(new Uint8Array(buf, fileofs, filelen));
};
const loadSubmodels = (loadmodel, buf) => {
    var view = new DataView(buf);
    var fileofs = view.getUint32((LUMP.models << 3) + 4, true);
    var filelen = view.getUint32((LUMP.models << 3) + 8, true);
    var count = filelen >> 6;
    if (count === 0)
        throw new Error('Mod.LoadSubmodels: funny lump size in ' + loadmodel.name);
    loadmodel.submodels = [];
    loadmodel.visleafs = view.getUint32(fileofs + 52, true);
    loadmodel.numleafs = loadmodel.visleafs;
    loadmodel.mins = [view.getFloat32(fileofs, true) - 1.0,
        view.getFloat32(fileofs + 4, true) - 1.0,
        view.getFloat32(fileofs + 8, true) - 1.0];
    loadmodel.maxs = [view.getFloat32(fileofs + 12, true) + 1.0,
        view.getFloat32(fileofs + 16, true) + 1.0,
        view.getFloat32(fileofs + 20, true) + 1.0];
    loadmodel.hulls[0].firstclipnode = view.getUint32(fileofs + 36, true);
    loadmodel.hulls[1].firstclipnode = view.getUint32(fileofs + 40, true);
    loadmodel.hulls[2].firstclipnode = view.getUint32(fileofs + 44, true);
    fileofs += 64;
    var i, clipnodes = loadmodel.hulls[0].clipnodes, out;
    for (i = 1; i < count; ++i) {
        out = findName('*' + i);
        out.needload = false;
        out.type = TYPE.brush;
        out.submodel = true;
        out.mins = [view.getFloat32(fileofs, true) - 1.0,
            view.getFloat32(fileofs + 4, true) - 1.0,
            view.getFloat32(fileofs + 8, true) - 1.0];
        out.maxs = [view.getFloat32(fileofs + 12, true) + 1.0,
            view.getFloat32(fileofs + 16, true) + 1.0,
            view.getFloat32(fileofs + 20, true) + 1.0];
        out.origin = [view.getFloat32(fileofs + 24, true), view.getFloat32(fileofs + 28, true), view.getFloat32(fileofs + 32, true)];
        out.hulls = [
            {
                clipnodes: clipnodes,
                firstclipnode: view.getUint32(fileofs + 36, true),
                lastclipnode: loadmodel.nodes.length - 1,
                planes: loadmodel.planes,
                clip_mins: [0.0, 0.0, 0.0],
                clip_maxs: [0.0, 0.0, 0.0]
            },
            {
                clipnodes: loadmodel.clipnodes,
                firstclipnode: view.getUint32(fileofs + 40, true),
                lastclipnode: loadmodel.clipnodes.length - 1,
                planes: loadmodel.planes,
                clip_mins: [-16.0, -16.0, -24.0],
                clip_maxs: [16.0, 16.0, 32.0]
            },
            {
                clipnodes: loadmodel.clipnodes,
                firstclipnode: view.getUint32(fileofs + 44, true),
                lastclipnode: loadmodel.clipnodes.length - 1,
                planes: loadmodel.planes,
                clip_mins: [-32.0, -32.0, -24.0],
                clip_maxs: [32.0, 32.0, 64.0]
            }
        ];
        out.textures = loadmodel.textures;
        out.lightdata = loadmodel.lightdata;
        out.faces = loadmodel.faces;
        out.visleafs = view.getUint32(fileofs + 52, true);
        out.firstface = view.getUint32(fileofs + 56, true);
        out.numfaces = view.getUint32(fileofs + 60, true);
        loadmodel.submodels[i - 1] = out;
        fileofs += 64;
    }
};
exports.loadBrushModel = (gl, buffer) => {
    const loadmodel = {
        type: 0,
        name: 'My Map',
        vertexes: [],
        radius: -1
    };
    var version = (new DataView(buffer)).getUint32(0, true);
    if (version !== 29) {
        throw new Error('Mod.LoadBrushModel: ' + loadmodel.name + ' has wrong version number (' + version + ' should be 29)');
    }
    loadVertexes(loadmodel, buffer);
    loadEdges(loadmodel, buffer, version);
    loadSurfedges(loadmodel, buffer);
    loadTextures(gl, loadmodel, buffer);
    loadLighting(loadmodel, buffer);
    loadPlanes(loadmodel, buffer);
    loadTexinfo(loadmodel, buffer);
    loadFaces(loadmodel, buffer);
    loadMarksurfaces(loadmodel, buffer);
    loadVisibility(loadmodel, buffer);
    loadLeafs(loadmodel, buffer);
    loadNodes(loadmodel, buffer);
    loadClipnodes(loadmodel, buffer);
    makeHull0(loadmodel);
    loadEntities(loadmodel, buffer);
    loadSubmodels(loadmodel, buffer);
    var i, vert, mins = [0.0, 0.0, 0.0], maxs = [0.0, 0.0, 0.0];
    for (i = 0; i < loadmodel.vertexes.length; ++i) {
        vert = loadmodel.vertexes[i];
        if (vert[0] < mins[0])
            mins[0] = vert[0];
        else if (vert[0] > maxs[0])
            maxs[0] = vert[0];
        if (vert[1] < mins[1])
            mins[1] = vert[1];
        else if (vert[1] > maxs[1])
            maxs[1] = vert[1];
        if (vert[2] < mins[2])
            mins[2] = vert[2];
        else if (vert[2] > maxs[2])
            maxs[2] = vert[2];
    }
    ;
    loadmodel.radius = common_1.radiusFromBounds(mins, maxs);
    return loadmodel;
};
//# sourceMappingURL=modelLoader.js.map