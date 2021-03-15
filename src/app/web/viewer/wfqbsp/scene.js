"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
const bsp_1 = require("./bsp");
const program_1 = require("./program");
const common_1 = require("./common");
const textures_1 = require("./textures");
const glstate_1 = require("../glstate");
const textures_2 = require("./textures");
const entities_1 = require("./entities");
const camera_1 = require("./camera");
const defs = require("./defs");
const world = require("./shaders/world");
const turbulent = require("./shaders/turbulent");
const sky = require("./shaders/sky");
const skyChain = require("./shaders/skyChain");
const mapAlpha_1 = require("./mapAlpha");
const batchRender_1 = require("./batchRender");
const model_1 = require("./model");
const lightmap_1 = require("./lightmap");
const cvr = {
    gl_overbright: { value: 1 },
    gl_fullbrights: { value: 0 },
    r_novis: { value: 0 },
    oldskyleaf: { value: 0 }
};
const ATTR_INDEX = {
    vert: 0,
    texCoords: 1,
    LMCoords: 2
};
const state = {
    oldtime: 0.0,
    realtime: 0.0,
    viewEnt: {
        origin: [0.0, 0.0, 0.0],
        angles: [0.0, 0.0, 0.0]
    },
    visframecount: 0,
    frustum: [{}, {}, {}, {}],
    vup: [],
    vpn: [],
    vright: [],
    fov: 110,
    origin: [0.0, 0.0, 0.0],
    refdef: {
        vrect: {},
        vieworg: [0.0, 0.0, 0.0],
        viewangles: [0.0, 0.0, 0.0],
        fov_x: 0,
        fov_y: 0
    },
    c_brush_verts: 0,
    c_alias_polys: 0,
    drawsky: true,
    viewleaf: {},
    oldviewleaf: null,
    perspective: [
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, -65540.0 / 65532.0, -1.0,
        0.0, 0.0, -524288.0 / 65532.0, 0.0
    ],
    // settings
    gamma: 1,
    skyvecs: null,
    model_vbo: null,
    framecount: 0,
    last_lightmap_allocated: 0,
    vis_changed: false,
    cl_worldmodel: null
};
exports.init = (gl) => {
    state.cl_worldmodel = bsp_1.model;
    state.oldtime = Date.now() * 0.001;
    state.viewEnt = entities_1.entities.find(ent => ent.classname === 'info_player_start');
    state.viewEnt.origin[0] += 100;
    state.visframecount = 0;
    state.frustum = [{ normal: [] }, { normal: [] }, { normal: [] }, { normal: [] }];
    state.vup = [];
    state.vpn = [];
    state.vright = [];
    state.c_brush_verts = 0;
    state.c_alias_polys = 0;
    state.fov = 90;
    state.refdef = {
        vrect: {},
        vieworg: [0.0, 0.0, 0.0],
        viewangles: [0.0, 0.0, 0.0],
        fov_x: 0,
        fov_y: 0
    };
    state.viewleaf = 0;
    state.gamma = 1;
    state.perspective = [
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, -65540.0 / 65532.0, -1.0,
        0.0, 0.0, -524288.0 / 65532.0, 0.0
    ];
    createShaders(gl);
    // const lm_allocated = [];
    // for (var i = 0; i < LIGHTMAP_DIM; ++i)
    // 	lm_allocated[i] = 0;
    // for (var j = 0; j < model.faces.length; ++j)
    // {
    // 	var surf = model.faces[j];
    // 	if ((surf.sky !== true) && (surf.turbulent !== true))
    // 	{
    // 		allocBlock(lm_allocated, surf);
    // 		if (model.lightdata != null)
    // 			buildLightMap(model, surf);
    // 	}
    // 	buildSurfaceDisplayList(model, surf);
    // }
    lightmap_1.init();
    lightmap_1.buildLightmaps(gl, bsp_1.model);
    buildSurfaceDisplayLists(bsp_1.model);
    buildModelVertexBuffer(gl, bsp_1.model);
    batchRender_1.init(gl);
    // bind(gl, 0, txState.lightmap_texture);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LIGHTMAP_DIM, LIGHTMAP_DIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, state.lightmaps);
    camera_1.init();
    camera_1.setOrigin(state.viewEnt.origin);
    camera_1.setOrigin([
        3.45011164689518,
        -235.36552253583477,
        275
    ]);
    camera_1.setAngles([0, 45, 0]);
    exports.makeSky(gl);
};
exports.free = (gl) => {
    program_1.freePrograms(gl);
    textures_2.freeTextures(gl);
};
const createShaders = (gl) => {
    // const glProg = createProgram(gl, 'world', world, [
    // 	{ name: 'Vert', index: ATTR_INDEX.vert },
    // 	{ name: 'TexCoords', index: ATTR_INDEX.texCoords },
    // 	{ name: 'LMCoords', index: ATTR_INDEX.LMCoords },	
    // ], 'world')
    program_1.createProgram(gl, world, 'World', ['uUseFullbrightTex', 'uUseOverbright', 'uUseAlphaTest',
        'uAlpha', 'uPerspective', 'uViewAngles', 'uViewOrigin',
        'uOrigin', 'uAngles', 'uFogDensity', 'uFogColor'], [
        ['Vert', gl.FLOAT, 3, false, ATTR_INDEX.vert],
        ['TexCoords', gl.FLOAT, 2, false, ATTR_INDEX.texCoords],
        ['LMCoords', gl.FLOAT, 2, false, ATTR_INDEX.LMCoords],
    ], ['Tex', 'LMTex', 'FullbrightTex']);
    program_1.createProgram(gl, turbulent, 'Turbulent', ['uOrigin', 'uAngles', 'uViewOrigin', 'uViewAngles', 'uPerspective', 'uGamma', 'uTime', 'uAlpha'], [['aPosition', gl.FLOAT, 3], ['aTexCoord', gl.FLOAT, 2]], ['tTexture']);
};
const perspective = (gl) => {
    var viewangles = [
        state.refdef.viewangles[0] * Math.PI / 180.0,
        (state.refdef.viewangles[1] - 90.0) * Math.PI / -180.0,
        state.refdef.viewangles[2] * Math.PI / -180.0
    ];
    var sp = Math.sin(viewangles[0]);
    var cp = Math.cos(viewangles[0]);
    var sy = Math.sin(viewangles[1]);
    var cy = Math.cos(viewangles[1]);
    var sr = Math.sin(viewangles[2]);
    var cr = Math.cos(viewangles[2]);
    // var f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    // var rangeInv = 1 / (near - far);
    // const 
    // const mdnPers =
    // [
    //   f / aspectRatio, 0,                          0,   0,
    //   0,               f,                          0,   0,
    //   0,               0,    (near + far) * rangeInv,  -1,
    //   0,               0,  near * far * rangeInv * 2,   0
    // ];
    // if (v.cvr.gamma.value < 0.5)
    // 	cvar.setValue('gamma', 0.5);
    // else if (v.cvr.gamma.value > 1.0)
    // 	cvar.setValue('gamma', 1.0);
    const viewMatrix = [
        cr * cy + sr * sp * sy, cp * sy, -sr * cy + cr * sp * sy,
        cr * -sy + sr * sp * cy, cp * cy, -sr * -sy + cr * sp * cy,
        sr * cp, -sp, cr * cp
    ];
    const what = 4.0;
    var ymax = what * Math.tan(state.refdef.fov_y * Math.PI / 360.0);
    state.perspective[0] = what / (ymax * glstate_1.dom.canvas.width / glstate_1.dom.canvas.height);
    state.perspective[5] = what / ymax;
    const programs = Object.values(program_1.state.programs);
    for (var i = 0; i < programs.length; ++i) {
        var program = programs[i];
        gl.useProgram(program.glHandle);
        if (program.uViewOrigin != null)
            gl.uniform3fv(program.uViewOrigin, state.refdef.vieworg);
        if (program.uViewAngles != null)
            gl.uniformMatrix3fv(program.uViewAngles, false, viewMatrix);
        if (program.uPerspective != null)
            gl.uniformMatrix4fv(program.uPerspective, false, state.perspective);
        if (program.uGamma != null)
            gl.uniform1f(program.uGamma, state.gamma);
    }
};
/*
================
BuildSurfaceDisplayLists -- called at level load time
================
*/
const buildSurfaceDisplayLists = (model) => {
    // int			i, lindex, lnumverts;
    // medge_t		*pedges, *r_pedge;
    // float		*vec;
    // float		s, t;
    // glpoly_t	*poly;
    // reconstruct the polygon
    //
    // draw texture
    //
    for (var i = 0; i < model.numfaces; i++) {
        if ((model.faces[i].flags & defs.SURF.drawtiled) && !(model.faces[i].flags & defs.SURF.drawtub))
            continue;
        var fa = model.faces[i];
        const polys = {
            next: fa.polys,
            numverts: fa.numedges,
            verts: []
        };
        fa.polys = polys;
        const texInfo = model.texinfo[fa.texinfo];
        const texture = model.textures[texInfo.texture];
        for (var j = 0; j < fa.numedges; j++) {
            var lindex = model.surfedges[fa.firstedge + j];
            var _vec, s, t;
            if (lindex > 0) {
                _vec = model.vertexes[model.edges[lindex][0]];
            }
            else {
                _vec = model.vertexes[model.edges[-lindex][1]];
            }
            s = vector_1.dotProduct(_vec, texInfo.vecs[0]) + texInfo.vecs[0][3];
            s /= texture.width;
            t = vector_1.dotProduct(_vec, texInfo.vecs[1]) + texInfo.vecs[1][3];
            t /= texture.height;
            polys.verts[j] = [];
            vector_1.copy(_vec, polys.verts[j]);
            polys.verts[j][3] = s;
            polys.verts[j][4] = t;
            //
            // lightmap texture coordinates
            //
            s = vector_1.dotProduct(_vec, texInfo.vecs[0]) + texInfo.vecs[0][3];
            s -= fa.texturemins[0];
            s += fa.light_s * 16;
            s += 8;
            s /= lightmap_1.LM_BLOCK_WIDTH * 16; //fa->texinfo->texture->width;
            t = vector_1.dotProduct(_vec, texInfo.vecs[1]) + texInfo.vecs[1][3];
            t -= fa.texturemins[1];
            t += fa.light_t * 16;
            t += 8;
            t /= lightmap_1.LM_BLOCK_HEIGHT * 16; //fa->texinfo->texture->height;
            polys.verts[j][5] = s;
            polys.verts[j][6] = t;
        }
        //johnfitz -- removed gl_keeptjunctions code
    }
};
const buildModelVertexBuffer = (gl, model) => {
    var v_buffer = [];
    var v_index = 0;
    for (var i = 0; i < model.faces.length; i++) {
        const surf = model.faces[i];
        surf.vbo_firstvert = v_index;
        for (var j = 0; j < surf.polys.verts.length; j++)
            for (var k = 0; k < 7; k++)
                v_buffer.push(surf.polys.verts[j][k] || 0);
        v_index += surf.polys.verts.length;
    }
    state.model_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.model_vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v_buffer), gl.STATIC_DRAW);
};
const setFov = (gl) => {
    if ((glstate_1.dom.canvas.width * 0.75) <= glstate_1.dom.canvas.height) {
        state.refdef.fov_x = state.fov;
        state.refdef.fov_y = Math.atan(glstate_1.dom.canvas.height / (glstate_1.dom.canvas.width / Math.tan(state.fov * Math.PI / 360.0))) * 360.0 / Math.PI;
    }
    else {
        state.refdef.fov_x = Math.atan(glstate_1.dom.canvas.width / (glstate_1.dom.canvas.height / Math.tan(state.fov * 0.82 * Math.PI / 360.0))) * 360.0 / Math.PI;
        state.refdef.fov_y = state.fov * 0.82;
    }
};
const setFrustum = () => {
    state.frustum[0].normal = vector_1.rotatePointAroundVector(state.vup, state.vpn, -(90.0 - state.refdef.fov_x * 0.5));
    state.frustum[1].normal = vector_1.rotatePointAroundVector(state.vup, state.vpn, 90.0 - state.refdef.fov_x * 0.5);
    state.frustum[2].normal = vector_1.rotatePointAroundVector(state.vright, state.vpn, 90.0 - state.refdef.fov_y * 0.5);
    state.frustum[3].normal = vector_1.rotatePointAroundVector(state.vright, state.vpn, -(90.0 - state.refdef.fov_y * 0.5));
    var i, out;
    for (i = 0; i <= 3; ++i) {
        out = state.frustum[i];
        out.type = 5;
        out.dist = vector_1.dotProduct(state.refdef.vieworg, out.normal);
        out.signbits = 0;
        if (out.normal[0] < 0.0)
            out.signbits = 1;
        if (out.normal[1] < 0.0)
            out.signbits += 2;
        if (out.normal[2] < 0.0)
            out.signbits += 4;
        if (out.normal[3] < 0.0)
            out.signbits += 8;
    }
};
/*
=============================================================================

The PVS must include a small area around the client to allow head bobbing
or other small motion on the client side.  Otherwise, a bob might cause an
entity that should be visible to not show up, especially when the bob
crosses a waterline.

=============================================================================
*/
var fatbytes;
var fatpvs;
var fatpvs_capacity;
const addToFatPVS = (org, node, worldmodel) => {
    // int		i;
    // byte	*pvs;
    // mplane_t	*plane;
    // float	d;
    while (1) {
        // if this is a leaf, accumulate the pvs bits
        if (node.contents < 0) {
            if (node.contents !== common_1.CONTENTS.solid) {
                var pvs = model_1.leafPVS(node, worldmodel); //johnfitz -- worldmodel as a parameter
                for (var i = 0; i < fatbytes; i++)
                    fatpvs[i] |= pvs[i];
            }
            return;
        }
        var plane = node.plane;
        var d = vector_1.dotProduct(org, plane.normal) - plane.dist;
        if (d > 8)
            node = node.children[0];
        else if (d < -8)
            node = node.children[1];
        else { // go down both
            addToFatPVS(org, node.children[0], worldmodel); //johnfitz -- worldmodel as a parameter
            node = node.children[1];
        }
    }
};
/*
=============
SV_FatPVS

Calculates a PVS that is the inclusive or of all leafs within 8 pixels of the
given point.
=============
*/
const fatPVS = (org, worldmodel) => //johnfitz -- added worldmodel as a parameter
 {
    fatbytes = (worldmodel.numleafs + 7) >> 3; // ericw -- was +31, assumed to be a bug/typo
    if (fatpvs == null || fatbytes > fatpvs_capacity) {
        fatpvs_capacity = fatbytes;
        fatpvs = new Uint8Array(new ArrayBuffer(fatpvs_capacity)).fill(0);
    }
    addToFatPVS(org, worldmodel.nodes, worldmodel); //johnfitz -- worldmodel as a parameter
    return fatpvs;
};
/*
================
R_ChainSurface -- ericw -- adds the given surface to its texture chain
================
*/
const chainSurface = (model, surf, chain) => {
    const texture = model.textures[model.texinfo[surf.texinfo].texture];
    surf.texturechain = texture.texturechains[chain];
    texture.texturechains[chain] = surf;
};
/*
===============
R_MarkSurfaces -- johnfitz -- mark surfaces based on PVS and rebuild texture chains
===============
*/
const markSurfaces = () => {
    var vis = [];
    // // clear lightmap chains
    // state.lightmap_polys = Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => {})
    // check this leaf for water portals
    // TODO: loop through all water surfs and use distance to leaf cullbox
    var nearwaterportal = false;
    for (var i = 0, mark = state.viewleaf.firstmarksurface; i < state.viewleaf.nummarksurfaces; i++, mark++)
        if (mark.flags & defs.SURF.drawtub)
            nearwaterportal = true;
    // choose vis data
    if (cvr.r_novis.value || state.viewleaf.contents === common_1.CONTENTS.solid || state.viewleaf.contents === common_1.CONTENTS.sky)
        vis = model_1.noVisPVS(state.cl_worldmodel);
    else if (nearwaterportal)
        vis = fatPVS(state.origin, state.cl_worldmodel);
    else
        vis = model_1.leafPVS(state.viewleaf, state.cl_worldmodel);
    // if surface chains don't need regenerating, just add static entities and return
    if (state.oldviewleaf == state.viewleaf && !state.vis_changed && !nearwaterportal) {
        // TODO: efrags
        // var leaf = state.cl_worldmodel.leafs[1];
        // for (i = 0 ; i < state.cl_worldmodel.leafs.length ; i++, leaf++)
        // 	if (vis[i>>3] & (1<<(i&7)))
        // 		if (leaf.efrags)
        // 			R_StoreEfrags (&leaf->efrags);
        return;
    }
    state.vis_changed = false;
    state.visframecount++;
    state.oldviewleaf = state.viewleaf;
    // iterate through leaves, marking surfaces
    for (i = 0; i < state.cl_worldmodel.numleafs - 1; i++) {
        var leaf = state.cl_worldmodel.leafs[i + 1];
        if (vis[i >> 3] & (1 << (i & 7))) {
            if (cvr.oldskyleaf.value || leaf.contents != common_1.CONTENTS.sky)
                for (var j = 0; j < leaf.nummarksurfaces; j++) {
                    const surf = state.cl_worldmodel.faces[state.cl_worldmodel.marksurfaces[leaf.firstmarksurface + j]];
                    surf.visframe = state.visframecount;
                }
            // add static models // TODO: efrags
            // if (leaf->efrags)
            // 	R_StoreEfrags (&leaf->efrags);
        }
    }
    // set all chains to null
    for (i = 0; i < state.cl_worldmodel.textures.length; i++)
        if (state.cl_worldmodel.textures[i])
            state.cl_worldmodel.textures[i].texturechains[defs.TEX_CHAIN.world] = null;
    // rebuild chains
    //iterate through surfaces one node at a time to rebuild chains
    //need to do it this way if we want to work with tyrann's skip removal tool
    //becuase his tool doesn't actually remove the surfaces from the bsp surfaces lump
    //nor does it remove references to them in each leaf's marksurfaces list
    for (i = 0; i < state.cl_worldmodel.nodes.length; i++)
        for (j = 0; j < state.cl_worldmodel.nodes[i].numfaces; j++) {
            var surf = state.cl_worldmodel.faces[state.cl_worldmodel.nodes[i].firstface + j];
            if (surf.visframe === state.visframecount) {
                chainSurface(state.cl_worldmodel, surf, defs.TEX_CHAIN.world);
            }
        }
};
// const buildLightmapChains = (model, chain) => {
// 	// texture_t *t;
// 	// msurface_t *s;
// 	// clear lightmap chains (already done in r_marksurfaces, but clearing them here to be safe becuase of r_stereo)
// 	state.lightmap_polys = []
// 	// now rebuild them
// 	for (var i = 0 ; i < model.textures.length; i++)
// 	{
// 		var tex = model.textures[i];
// 		if (!tex || !tex.texturechains[chain])
// 			continue;
// 		for (var s = tex.texturechains[chain]; !!s; s = s.texturechain)
// 			if (!s.culled)
// 				renderDynamicLightmaps (model, s);
// 	}
// }
const setupGL = (gl) => {
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
};
exports.calcRefdef = () => {
    state.refdef.vieworg[0] = camera_1.state.origin[0] + 0.03125;
    state.refdef.vieworg[1] = camera_1.state.origin[1] + 0.03125;
    state.refdef.vieworg[2] = camera_1.state.origin[2] + 0.03125;
    state.refdef.viewangles[0] = camera_1.state.angles[0];
    state.refdef.viewangles[1] = camera_1.state.angles[1];
    state.refdef.viewangles[2] = camera_1.state.angles[2];
    // var ipitch = cvr.idlescale.value * Math.sin(cl.clState.time * cvr.ipitch_cycle.value) * cvr.ipitch_level.value;
    // var iyaw = cvr.idlescale.value * Math.sin(cl.clState.time * cvr.iyaw_cycle.value) * cvr.iyaw_level.value;
    // var iroll = cvr.idlescale.value * Math.sin(cl.clState.time * cvr.iroll_cycle.value) * cvr.iroll_level.value;
    // r.state.refdef.viewangles[0] += ipitch;
    // r.state.refdef.viewangles[1] += iyaw;
    // r.state.refdef.viewangles[2] += iroll;
    // var forward = [], right = [], up = [];
    // vec.angleVectors([-ent.angles[0], ent.angles[1], ent.angles[2]], forward, right, up);
    // r.state.refdef.vieworg[0] += cvr.ofsx.value * forward[0] + cvr.ofsy.value * right[0] + cvr.ofsz.value * up[0];
    // r.state.refdef.vieworg[1] += cvr.ofsx.value * forward[1] + cvr.ofsy.value * right[1] + cvr.ofsz.value * up[1];
    // r.state.refdef.vieworg[2] += cvr.ofsx.value * forward[2] + cvr.ofsy.value * right[2] + cvr.ofsz.value * up[2];
    // if (r.state.refdef.vieworg[0] < (ent.origin[0] - 14.0))
    // 	r.state.refdef.vieworg[0] = ent.origin[0] - 14.0;
    // else if (r.state.refdef.vieworg[0] > (ent.origin[0] + 14.0))
    // 	r.state.refdef.vieworg[0] = ent.origin[0] + 14.0;
    // if (r.state.refdef.vieworg[1] < (ent.origin[1] - 14.0))
    // 	r.state.refdef.vieworg[1] = ent.origin[1] - 14.0;
    // else if (r.state.refdef.vieworg[1] > (ent.origin[1] + 14.0))
    // 	r.state.refdef.vieworg[1] = ent.origin[1] + 14.0;
    // if (r.state.refdef.vieworg[2] < (ent.origin[2] - 22.0))
    // 	r.state.refdef.vieworg[2] = ent.origin[2] - 22.0;
    // else if (r.state.refdef.vieworg[2] > (ent.origin[2] + 30.0))
    // 	r.state.refdef.vieworg[2] = ent.origin[2] + 30.0;
    // var view = cl.clState.viewent;
    // view.angles[0] = -r.state.refdef.viewangles[0] - ipitch;
    // view.angles[1] = r.state.refdef.viewangles[1] - iyaw;
    // view.angles[2] = cl.clState.viewangles[2] - iroll;
    // view.origin[0] = ent.origin[0] + forward[0] * bob * 0.4;
    // view.origin[1] = ent.origin[1] + forward[1] * bob * 0.4;
    // view.origin[2] = ent.origin[2] + cl.clState.viewheight + forward[2] * bob * 0.4 + bob;
    // switch (scr.cvr.viewsize.value)
    // {
    // case 110:
    // case 90:
    // 	view.origin[2] += 1.0;
    // 	break;
    // case 100:
    // 	view.origin[2] += 2.0;
    // 	break;
    // case 80:
    // 	view.origin[2] += 0.5;
    // }
    // view.model = cl.clState.model_precache[cl.clState.stats[def.STAT.weapon]];
    // view.frame = cl.clState.stats[def.STAT.weaponframe];
    // r.state.refdef.viewangles[0] += cl.clState.punchangle[0];
    // r.state.refdef.viewangles[1] += cl.clState.punchangle[1];
    // r.state.refdef.viewangles[2] += cl.clState.punchangle[2];
    // if ((cl.clState.onground === true) && ((ent.origin[2] - oldz) > 0.0))
    // {
    // 	var steptime = cl.clState.time - cl.clState.oldtime;
    // 	if (steptime < 0.0)
    // 		steptime = 0.0;
    // 	oldz += steptime * 80.0;
    // 	if (oldz > ent.origin[2])
    // 		oldz = ent.origin[2];
    // 	else if ((ent.origin[2] - oldz) > 12.0)
    // 		oldz = ent.origin[2] - 12.0;
    // 	r.state.refdef.vieworg[2] += oldz - ent.origin[2];
    // 	view.origin[2] += oldz - ent.origin[2];
    // }
    // else
    // 	oldz = ent.origin[2];
    // if (chase.cvr.active.value !== 0)
    // 	chase.update();
};
/*
================
R_BackFaceCull -- johnfitz -- returns true if the surface is facing away from vieworg
================
*/
const backFaceCull = (surf) => {
    var dot;
    switch (surf.plane.type) {
        case defs.PLANE.x:
            dot = state.refdef.vieworg[0] - surf.plane.dist;
            break;
        case defs.PLANE.y:
            dot = state.refdef.vieworg[1] - surf.plane.dist;
            break;
        case defs.PLANE.z:
            dot = state.refdef.vieworg[2] - surf.plane.dist;
            break;
        default:
            dot = vector_1.dotProduct(state.refdef.vieworg, surf.plane.normal) - surf.plane.dist;
            break;
    }
    if ((dot < 0) !== !!(surf.flags & defs.SURF.planeback))
        return true;
    return false;
};
/*
=================
R_CullBox -- johnfitz -- replaced with new function from lordhavoc

Returns true if the box is completely outside the frustum
=================
*/
const cullBox = (emins, emaxs) => {
    for (var i = 0; i < 4; i++) {
        var p = state.frustum[i];
        switch (p.signbits) {
            default:
            case 0:
                if (p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2] < p.dist)
                    return true;
                break;
            case 1:
                if (p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2] < p.dist)
                    return true;
                break;
            case 2:
                if (p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2] < p.dist)
                    return true;
                break;
            case 3:
                if (p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2] < p.dist)
                    return true;
                break;
            case 4:
                if (p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2] < p.dist)
                    return true;
                break;
            case 5:
                if (p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2] < p.dist)
                    return true;
                break;
            case 6:
                if (p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2] < p.dist)
                    return true;
                break;
            case 7:
                if (p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2] < p.dist)
                    return true;
                break;
        }
    }
    return false;
};
exports.textureAnimation = function (base, entFrame) {
    if (entFrame)
        if (base.alternate_anims)
            base = base.alternate_anims;
    var frame = 0;
    if (base.anim_base != null) {
        frame = base.anim_frame;
        base = bsp_1.model.textures[base.anim_base];
    }
    var anims = base.anims;
    if (anims == null)
        return base;
    return bsp_1.model.textures[anims[(Math.floor(state.realtime * 5.0) + frame) % anims.length]];
};
// export const animateLight = function(gl: WebGLRenderingContext)
// {
// 	var j;
// 	// if (cvr.fullbright.value === 0)
// 	// {
// 	// 	var i = Math.floor(cl.clState.time * 10.0);
// 	// 	for (j = 0; j < 64; ++j)
// 	// 	{
// 	// 		if (cl.state.lightstyle[j].length === 0)
// 	// 		{
// 	// 			state.lightstylevalue[j] = 12;
// 	// 			continue;
// 	// 		}
// 	// 		state.lightstylevalue[j] = cl.state.lightstyle[j].charCodeAt(i % cl.state.lightstyle[j].length) - 97;
// 	// 	}
// 	// }
// 	// else
// 	// {
// 		for (j = 0; j < 256; ++j)
// 			state.lightstylevalue[j] = 12; // Should this be 256?
// 	// }
// 	bind(gl, 0, txState.lightstyle_texture);
// 	gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 64, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE, state.lightstylevalue);
// };
/*
================
R_CullSurfaces -- johnfitz
================
*/
const cullSurfaces = (model, chain) => {
    // ericw -- instead of testing (s->visframe == r_visframecount) on all world
    // surfaces, use the chained surfaces, which is exactly the same set of sufaces
    for (var i = 0; i < model.textures.length; i++) {
        var t = model.textures[i];
        if (!t || !t.texturechains[chain])
            continue;
        for (var s = t.texturechains[chain]; s; s = s.texturechain) {
            if (cullBox(s.mins, s.maxs) || backFaceCull(s))
                s.culled = true;
            else {
                s.culled = false;
                // rs_brushpolys++; //count wpolys here // TODO stats
                const texture = model.textures[model.texinfo[s.texinfo].texture];
                if (texture.warpimage)
                    texture.update_warp = true;
            }
        }
    }
};
// const renderDynamicLightmaps = (model, surf) =>
// {
// 	// byte		*base;
// 	// int			maps;
// 	// glRect_t    *theRect;
// 	// int smax, tmax;
// 	if (surf.flags & defs.SURF.drawtiled) //johnfitz -- not a lightmapped surface
// 		return;
// 	// add to lightmap chain
// 	surf.polys.chain = state.lightmap_polys[surf.lightmaptexturenum];
// 	state.lightmap_polys[surf.lightmaptexturenum] = surf.polys;
// 	var doDynamic = false
// 	// check for lightmap modification
// 	for (var maps=0; maps < MAXLIGHTMAPS && surf.styles[maps]; maps++)
// 		if (state.lightstylevalue[surf.styles[maps]] != surf.cached_light[maps]){
// 			doDynamic= true
// 			break
// 		}
// 	if (doDynamic 
// 		|| surf.dlightframe == state.framecount	// dynamic this frame
// 		|| surf.cached_dlight)			// dynamic previously
// 	{
// 		if (true) // (r_dynamic.value)
// 		{
// 			state.lightmap_modified[surf.lightmaptexturenum] = true;
// 			var theRect = state.lightmap_rectchange[surf.lightmaptexturenum];
// 			if (surf.light_t < theRect.t) {
// 				if (theRect.h)
// 					theRect.h += theRect.t - surf.light_t;
// 				theRect.t = surf.light_t;
// 			}
// 			if (surf.light_s < theRect.l) {
// 				if (theRect.w)
// 					theRect.w += theRect.l - surf.light_s;
// 				theRect.l = surf.light_s;
// 			}
// 			var smax = (surf.extents[0]>>4)+1;
// 			var tmax = (surf.extents[1]>>4)+1;
// 			if ((theRect.w + theRect.l) < (surf.light_s + smax))
// 				theRect.w = (surf.light_s-theRect.l)+smax;
// 			if ((theRect.h + theRect.t) < (surf.light_t + tmax))
// 				theRect.h = (surf.light_t-theRect.t)+tmax;
// 			var bufOfs = surf.lightmaptexturenum * state.lightmap_bytes * LM_BLOCK_WIDTH * LM_BLOCK_HEIGHT;
// 			bufOfs += surf.light_t * LM_BLOCK_WIDTH * state.lightmap_bytes + surf.light_s * state.lightmap_bytes;
// 			buildLightMap (model, surf, bufOfs, LM_BLOCK_WIDTH * state.lightmap_bytes);
// 		}
// 	}
// }
const waterAlphaForSurface = (surf) => {
    if (surf.flags & defs.SURF.drawlava)
        return mapAlpha_1.state.lava > 0 ? mapAlpha_1.state.lava : mapAlpha_1.state.water;
    else if (surf.flags & defs.SURF.drawtele)
        return mapAlpha_1.state.tele > 0 ? mapAlpha_1.state.tele : mapAlpha_1.state.water;
    else if (surf.flags & defs.SURF.drawslime)
        return mapAlpha_1.state.slime > 0 ? mapAlpha_1.state.slime : mapAlpha_1.state.water;
    else
        return mapAlpha_1.state.water;
};
/*
================
GL_WaterAlphaForEntitySurface -- ericw
 
Returns the water alpha to use for the entity and surface combination.
================
*/
const waterAlphaForEntitySurface = (ent, surf) => {
    var entalpha = 1;
    if (!ent || ent.alpha == 1)
        entalpha = waterAlphaForSurface(surf);
    else
        entalpha = 1; // pr.decodeAlpha(ent.alpha);
    return entalpha;
};
/*
================
R_DrawTextureChains_Water -- johnfitz
================
*/
const drawWater = (gl, model, ent, chain) => {
    // int			i;
    // msurface_t	*s;
    // texture_t	*t;
    // glpoly_t	*p;
    // qboolean	bound;
    // float entalpha;
    // if (r_oldwater.value)
    // {
    const turbulentProgram = program_1.useProgram(gl, 'Turbulent');
    // Bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, state.model_vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // indices come from client memory!
    gl.vertexAttribPointer(ATTR_INDEX.vert, 3, gl.FLOAT, false, defs.VERTEXSIZE * 4, 0);
    gl.vertexAttribPointer(ATTR_INDEX.texCoords, 2, gl.FLOAT, false, defs.VERTEXSIZE * 4, 4 * 3);
    // set uniforms
    gl.uniform1i(turbulentProgram.uUseOverbright, cvr.gl_overbright.value);
    gl.uniform1i(turbulentProgram.uUseAlphaTest, 0);
    gl.uniform1f(turbulentProgram.uAlpha, entalpha);
    gl.uniform3f(turbulentProgram.uOrigin, 0.0, 0.0, 0.0);
    gl.uniformMatrix3fv(turbulentProgram.uAngles, false, common_1.identity);
    gl.uniform1f(turbulentProgram.uTime, state.realtime % (Math.PI * 2.0));
    gl.uniform1f(turbulentProgram.uAlpha, 1);
    for (var i = 0; i < model.textures.length; i++) {
        var t = model.textures[i];
        if (!t || !t.texturechains[chain] || !(t.texturechains[chain].flags & defs.SURF.drawtub))
            continue;
        var animatedTexture = exports.textureAnimation(t, ent != null ? ent.frame : 0);
        batchRender_1.clearBatch();
        var bound = false;
        var entalpha = 1;
        for (var s = t.texturechains[chain]; s; s = s.texturechain)
            if (!s.culled) {
                if (!bound) //only bind once we are sure we need this texture
                 {
                    //entalpha = GL_WaterAlphaForEntitySurface (ent, s);
                    //R_BeginTransparentDrawing (entalpha);
                    textures_1.bind(gl, 0, animatedTexture.texturenum);
                    bound = true;
                }
                var newalpha = waterAlphaForEntitySurface(ent, s);
                if (newalpha !== entalpha) {
                    if (newalpha < 1) {
                        gl.depthMask(false);
                        gl.enable(gl.BLEND);
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    }
                    else {
                        gl.depthMask(true);
                        gl.disable(gl.BLEND);
                    }
                    gl.uniform1f(turbulentProgram.uAlpha, newalpha);
                }
                entalpha = newalpha;
                batchRender_1.batchSurface(gl, s);
            }
        //R_EndTransparentDrawing (entalpha);
    }
    batchRender_1.flushBatch(gl);
    program_1.unbindProgram(gl);
    // }
    // else
    // {
    // for (var i=0 ; i < model.textures.length ; i++)
    // {
    // 	var t = model.textures[i];
    // 	if (!t || !t.texturechains[chain] || !(t.texturechains[chain].flags & defs.SURF.drawtub))
    // 		continue;
    // 	var bound = false;
    // 	var entalpha = 1.0;
    // 	for (var s = t.texturechains[chain]; !!s; s = s.texturechain)
    // 		if (!s.culled)
    // 		{
    // 			if (!bound) //only bind once we are sure we need this texture
    // 			{
    // 				// entalpha = GL_WaterAlphaForEntitySurface (ent, s);
    // 				// R_BeginTransparentDrawing (entalpha);
    // 				GL_Bind (t->warpimage);
    // 				if (model !== state.cl_worldmodel)
    // 				{
    // 					// ericw -- this is copied from R_DrawSequentialPoly.
    // 					// If the poly is not part of the world we have to
    // 					// set this flag
    // 					// Joe - Mutating in render is smelly
    // 					t.update_warp = true; // FIXME: one frame too late!
    // 				}
    // 				bound = true;
    // 			}
    // 			DrawGLPoly (s->polys);
    // 			rs_brushpasses++;
    // 		}
    // 	R_EndTransparentDrawing (entalpha);
    // }
    //} // oldwater
};
/*
================
R_DrawTextureChains -- ericw

Draw lightmapped surfaces with fulbrights in one pass, using VBO.
Requires 3 TMUs, OpenGL 2.0
================
*/
const drawTextureChains = (gl, model, ent, chain) => {
    var entalpha = 1;
    // if (ent != NULL)
    // 	entalpha = ENTALPHA_DECODE(ent->alpha);
    // else
    // 	entalpha = 1;
    // TODO Dynamic LMs
    // ericw -- the mh dynamic lightmap speedup: make a first pass through all
    // surfaces we are going to draw, and rebuild any lightmaps that need it.
    // this also chains surfaces by lightmap which is used by r_lightmap 1.
    // the previous implementation of the speedup uploaded lightmaps one frame
    // late which was visible under some conditions, this method avoids that.
    //buildLightmapChains (model, chain);
    //uploadLightmaps (gl);
    // if (r_drawflat_cheatsafe)
    // {
    // 	glDisable (GL_TEXTURE_2D);
    // 	R_DrawTextureChains_Drawflat (model, chain);
    // 	glEnable (GL_TEXTURE_2D);
    // 	return;
    // }
    // if (r_fullbright_cheatsafe)
    // {
    // 	R_BeginTransparentDrawing (entalpha);
    // 	R_DrawTextureChains_TextureOnly (model, ent, chain);
    // 	R_EndTransparentDrawing (entalpha);
    // 	goto fullbrights;
    // }
    // if (r_lightmap_cheatsafe)
    // {
    // 	if (!gl_overbright.value)
    // 	{
    // 		glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE);
    // 		glColor3f(0.5, 0.5, 0.5);
    // 	}
    // 	R_DrawLightmapChains ();
    // 	if (!gl_overbright.value)
    // 	{
    // 		glColor3f(1,1,1);
    // 		glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_REPLACE);
    // 	}
    // 	R_DrawTextureChains_White (model, chain);
    // 	return;
    // }
    // R_BeginTransparentDrawing (entalpha);
    // R_DrawTextureChains_NoTexture (model, chain);
    // R_EndTransparentDrawing (entalpha);
    var fullbright = null;
    // enable blending / disable depth writes
    if (entalpha < 1) {
        gl.depthMask(gl.FALSE);
        gl.enable(gl.BLEND);
    }
    const worldProgram = program_1.useProgram(gl, 'World');
    // Bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, state.model_vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // indices come from client memory!
    // Until all shaders use "useProgram" we do this manually 
    gl.enableVertexAttribArray(ATTR_INDEX.vert);
    gl.enableVertexAttribArray(ATTR_INDEX.texCoords);
    gl.enableVertexAttribArray(ATTR_INDEX.LMCoords);
    gl.vertexAttribPointer(ATTR_INDEX.vert, 3, gl.FLOAT, gl.FALSE, defs.VERTEXSIZE * 4, 0);
    gl.vertexAttribPointer(ATTR_INDEX.texCoords, 2, gl.FLOAT, gl.FALSE, defs.VERTEXSIZE * 4, 4 * 3);
    gl.vertexAttribPointer(ATTR_INDEX.LMCoords, 2, gl.FLOAT, gl.FALSE, defs.VERTEXSIZE * 4, 4 * 5);
    // set uniforms
    // gl.uniform1i (uniforms.tex, 0);
    // gl.uniform1i (uniforms.LMTex, 1);
    // gl.uniform1i (uniforms.fullbrightTex, 2);
    gl.uniform1i(worldProgram.uUseFullbrightTex, 0);
    gl.uniform1i(worldProgram.uUseOverbright, cvr.gl_overbright.value);
    gl.uniform1i(worldProgram.uUseAlphaTest, 0);
    gl.uniform1f(worldProgram.uAlpha, entalpha);
    gl.uniform1f(worldProgram.uFogDensity, 0.039 / 64);
    gl.uniform4f(worldProgram.uFogColor, .2, .16, .15, 1);
    // gl.uniform1i (worldProgram.tex, 0)
    // gl.uniform1i (worldProgram.LMTex, 1)
    // //gl.uniform1i (uniforms.fullbrightTex, 2)
    gl.uniform3f(worldProgram.uOrigin, 0.0, 0.0, 0.0);
    gl.uniformMatrix3fv(worldProgram.uAngles, false, common_1.identity);
    for (var i = 0; i < model.textures.length; i++) {
        var t = model.textures[i];
        if (!t || !t.texturechains[chain] || t.texturechains[chain].flags & (defs.SURF.drawtiled | defs.SURF.notexture | defs.SURF.drawtub))
            continue;
        var animatedTexture = exports.textureAnimation(t, ent != null ? ent.frame : 0);
        // Enable/disable TMU 2 (fullbrights)
        // FIXME: Move below to where we bind GL_TEXTURE0
        if (cvr.gl_fullbrights.value && (fullbright = animatedTexture.fullbright)) {
            //gl.activeTexture (gl.TEXTURE2);
            textures_1.bind(gl, 2, fullbright);
            gl.uniform1i(worldProgram.uUseFullbrightTex, 1);
        }
        else {
            gl.uniform1i(worldProgram.uUseFullbrightTex, 0);
            textures_1.bind(gl, 2, textures_2.state.null_texture);
        }
        batchRender_1.clearBatch();
        var bound = false;
        var lastlightmap = 0; // avoid compiler warning
        for (var s = t.texturechains[chain]; !!s; s = s.texturechain)
            if (!s.culled) {
                if (!bound) //only bind once we are sure we need this texture
                 {
                    // gl.activeTexture(gl.TEXTURE0);
                    textures_1.bind(gl, 0, animatedTexture.texturenum);
                    if (t.texturechains[chain].flags & defs.SURF.drawfence)
                        gl.uniform1i(worldProgram.uUseAlphaTest, 1); // Flip alpha test back on
                    bound = true;
                    lastlightmap = s.lightmaptexturenum;
                }
                if (s.lightmaptexturenum !== lastlightmap)
                    batchRender_1.flushBatch(gl);
                //gl.activeTexture (gl.TEXTURE1);
                textures_1.bind(gl, 1, textures_2.state.lightmap_textures[s.lightmaptexturenum].texnum);
                // gl.activeTexture(gl.TEXTURE1)
                // gl.bindTexture(gl.TEXTURE_2D, txState.lightmap_textures[s.lightmaptexturenum].texnum);
                lastlightmap = s.lightmaptexturenum;
                batchRender_1.batchSurface(gl, s);
                // rs_brushpasses++; // stats
            }
        batchRender_1.flushBatch(gl);
        if (bound && t.texturechains[chain].flags & defs.SURF.drawfence)
            gl.uniform1i(worldProgram.useAlphaTest, 0); // Flip alpha test back off
    }
    // clean up
    gl.disableVertexAttribArray(ATTR_INDEX.vert);
    gl.disableVertexAttribArray(ATTR_INDEX.texCoords);
    gl.disableVertexAttribArray(ATTR_INDEX.LMCoords);
    program_1.unbindProgram(gl);
    //gl.selectTexture(gl.TEXTURE0);
    if (entalpha < 1) {
        gl.depthMask(gl.TRUE);
        gl.disable(gl.BLEND);
    }
};
const updateTime = () => {
    state.realtime = Date.now() * 0.001 - state.oldtime;
};
const drawWorld = (gl) => {
    drawTextureChains(gl, bsp_1.model, null, defs.TEX_CHAIN.world);
};
exports.makeSky = function (gl) {
    var sin = [0.0, 0.19509, 0.382683, 0.55557, 0.707107, 0.831470, 0.92388, 0.980785, 1.0];
    var vecs = [], i, j;
    for (i = 0; i < 7; i += 2) {
        vecs = vecs.concat([
            0.0, 0.0, 1.0,
            sin[i + 2] * 0.19509, sin[6 - i] * 0.19509, 0.980785,
            sin[i] * 0.19509, sin[8 - i] * 0.19509, 0.980785
        ]);
        for (j = 0; j < 7; ++j) {
            vecs = vecs.concat([
                sin[i] * sin[8 - j], sin[8 - i] * sin[8 - j], sin[j],
                sin[i] * sin[7 - j], sin[8 - i] * sin[7 - j], sin[j + 1],
                sin[i + 2] * sin[7 - j], sin[6 - i] * sin[7 - j], sin[j + 1],
                sin[i] * sin[8 - j], sin[8 - i] * sin[8 - j], sin[j],
                sin[i + 2] * sin[7 - j], sin[6 - i] * sin[7 - j], sin[j + 1],
                sin[i + 2] * sin[8 - j], sin[6 - i] * sin[8 - j], sin[j]
            ]);
        }
    }
    program_1.createProgram(gl, sky, 'Sky', ['uViewAngles', 'uPerspective', 'uScale', 'uGamma', 'uTime'], [['aPosition', gl.FLOAT, 3]], ['tSolid', 'tAlpha']);
    program_1.createProgram(gl, skyChain, 'SkyChain', ['uViewOrigin', 'uViewAngles', 'uPerspective'], [['aPosition', gl.FLOAT, 3]], []);
    state.skyvecs = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.skyvecs);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vecs), gl.STATIC_DRAW);
};
exports.drawSkyBox = function (gl) {
    if (state.drawsky !== true)
        return;
    gl.colorMask(false, false, false, false);
    var clmodel = state.cl_worldmodel;
    var program = program_1.useProgram(gl, 'SkyChain');
    gl.bindBuffer(gl.ARRAY_BUFFER, state.model_vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.vertexAttribPointer(program.aPosition.location, 3, gl.FLOAT, false, defs.VERTEXSIZE * 4, 0);
    for (var i = 0; i < clmodel.textures.length; i++) {
        var t = clmodel.textures[i];
        if (!t || !t.texturechains || !t.texturechains[defs.TEX_CHAIN.world] || !(t.texturechains[defs.TEX_CHAIN.world].flags & defs.SURF.drawsky))
            continue;
        for (var s = t.texturechains[defs.TEX_CHAIN.world]; !!s; s = s.texturechain)
            if (!s.culled) {
                batchRender_1.batchSurface(gl, s);
            }
    }
    batchRender_1.flushBatch(gl);
    gl.colorMask(true, true, true, true);
    gl.depthFunc(gl.GREATER);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    program = program_1.useProgram(gl, 'Sky');
    gl.uniform2f(program.uTime, (state.realtime * 0.125) % 1.0, (state.realtime * 0.03125) % 1.0);
    textures_1.bind(gl, program.tSolid, textures_2.state.solidskytexture);
    textures_1.bind(gl, program.tAlpha, textures_2.state.alphaskytexture);
    gl.bindBuffer(gl.ARRAY_BUFFER, state.skyvecs);
    gl.vertexAttribPointer(program.aPosition.location, 3, gl.FLOAT, false, 12, 0);
    gl.uniform3f(program.uScale, 2.0, -2.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, 2.0, -2.0, -1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, 2.0, 2.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, 2.0, 2.0, -1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, -2.0, -2.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, -2.0, -2.0, -1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, -2.0, 2.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.uniform3f(program.uScale, -2.0, 2.0, -1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 180);
    gl.enable(gl.CULL_FACE);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
};
// export const setupView = (gl: WebGLRenderingContext) => {
// }
exports.draw = (gl) => {
    updateTime();
    gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT);
    exports.calcRefdef();
    vector_1.copy(state.refdef.vieworg, state.origin);
    vector_1.angleVectors(state.refdef.viewangles, state.vpn, state.vright, state.vup);
    state.oldviewleaf = state.viewleaf;
    state.viewleaf = bsp_1.pointInLeaf(state.origin, state.cl_worldmodel);
    setFrustum();
    markSurfaces();
    cullSurfaces(bsp_1.model, defs.TEX_CHAIN.world);
    state.c_brush_verts = 0;
    state.c_alias_polys = 0;
    // v.setContentsColor(state.viewleaf.contents);
    // v.calcBlend();
    // state.dowarp = (cvr.waterwarp.value !== 0) && (state.viewleaf.contents <= mod.CONTENTS.water);
    setFov(gl);
    setupGL(gl);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    perspective(gl);
    exports.drawSkyBox(gl);
    drawWorld(gl);
    drawWater(gl, bsp_1.model, null, defs.TEX_CHAIN.world);
    gl.disable(gl.CULL_FACE);
};
//# sourceMappingURL=scene.js.map