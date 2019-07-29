import {loadLightmapTexture, bind, state as txState} from './texture'
import * as cl from './cl'
import * as vec from './vec'

export const LM_BLOCK_WIDTH = 128
export const LM_BLOCK_HEIGHT = 128
export const MAXLIGHTMAPS = 512
export const MAX_DLIGHTS = 64 // original quake: 32

const cvr = {
	gl_overbright: {value: 1},
	gl_fullbrights: {value: 0},
	r_novis: {value: 0},
	oldskyleaf: {value: 0}
}

export const state = {
	lightmap_polys: [],
	lightmap_modified: [],
	lightmap_rectchange: [],
	lightstylevalue: new Uint32Array(new ArrayBuffer(256 * 4)),
	blocklights: new Uint32Array(new ArrayBuffer(3 * LM_BLOCK_HEIGHT * LM_BLOCK_WIDTH)),
	lightmap_bytes: 4,
	lightmaps: new Uint8Array(new ArrayBuffer(4 * MAXLIGHTMAPS * LM_BLOCK_HEIGHT * LM_BLOCK_WIDTH)),
  allocated: Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => []),
  framecount: 0,
  last_lightmap_allocated: 0
}

export const init = () => {	
	state.lightmap_polys = Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => {})

	for (var i=0 ; i<256 ; i++)
		state.lightstylevalue[i] = 264;	

	state.lightmap_modified = Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => false)
	state.lightmap_rectchange = Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => ({l:0, t:0, w:0, h:0}))

	state.allocated = Array.apply(null, new Array(MAXLIGHTMAPS)).map(() => 
		Array.apply(null, new Array(LM_BLOCK_WIDTH)).map(() => 0))
	state.last_lightmap_allocated = 0;

	state.framecount = 1; // no dlightcache
}

/*
========================
AllocBlock -- returns a texture number and the position inside it
========================
*/
const allocBlock = (surf) => {
	var	i, j;
	var	best, best2;
	var	texnum;
	var w = (surf.extents[0]>>4)+1;
	var h = (surf.extents[1]>>4)+1;

	// ericw -- rather than searching starting at lightmap 0 every time,
	// start at the last lightmap we allocated a surface in.
	// This makes AllocBlock much faster on large levels (can shave off 3+ seconds
	// of load time on a level with 180 lightmaps), at a cost of not quite packing
	// lightmaps as tightly vs. not doing this (uses ~5% more lightmaps)
	for (texnum=state.last_lightmap_allocated ; texnum<MAXLIGHTMAPS ; texnum++, state.last_lightmap_allocated++)
	{
		best = LM_BLOCK_HEIGHT;

		for (i=0 ; i<LM_BLOCK_WIDTH-w ; i++)
		{
			best2 = 0;

			for (j=0 ; j<w ; j++)
			{
				if (state.allocated[texnum][i+j] >= best)
					break;
				if (state.allocated[texnum][i+j] > best2)
					best2 = state.allocated[texnum][i+j];
			}
			if (j == w)
			{	// this is a valid spot
				surf.light_s = i;
				surf.light_t = best = best2;
			}
		}

		if (best + h > LM_BLOCK_HEIGHT)
			continue;

		for (i=0 ; i<w ; i++)
			state.allocated[texnum][surf.light_s + i] = best + h;

		return texnum;
	}

	throw new Error ("AllocBlock: full");
}

export const createSurfaceLightmap = (model, surf) => {
	surf.lightmaptexturenum = allocBlock (surf);

	var bufOfs = surf.lightmaptexturenum * state.lightmap_bytes * LM_BLOCK_WIDTH * LM_BLOCK_HEIGHT;
	bufOfs += (surf.light_t * LM_BLOCK_WIDTH + surf.light_s) * state.lightmap_bytes;
	buildLightMap (model, surf, bufOfs, LM_BLOCK_WIDTH * state.lightmap_bytes);
}

const addDynamicLights = (model, surf) => {

	// int			lnum;
	// int			sd, td;
	// float		dist, rad, minlight;
	// vec3_t		impact, local;
	// int			s, t;
	// int			i;
	// int			smax, tmax;
	// mtexinfo_t	*tex;
	// //johnfitz -- lit support via lordhavoc
	// float		cred, cgreen, cblue, brightness;
	// unsigned	*bl;
	// //johnfitz

	var smax = (surf.extents[0] >> 4) + 1;
	var tmax = (surf.extents[1] >> 4) + 1;
	var tex = model.texinfo[surf.texinfo];
	var impact = [], local = []
	var sd, td, brightness, blidx;

	for (var i = 0; i < MAX_DLIGHTS; i++)
	{
		if (! (surf.dlightbits[i >> 5] & (1 << (i & 31))))
			continue;		// not lit by this light

		var rad = cl.state.dlights[i].radius;
		var dist = vec.dotProduct (cl.state.dlights[i].origin, surf.plane.normal) -
				surf.plane.dist;

		rad -= Math.abs(dist);

		var minlight = cl.state.dlights[i].minlight;
		if (rad < minlight)
			continue;

		minlight = rad - minlight;

		for (var j=0 ; j<3 ; j++)
		{
			impact[i] = cl.state.dlights[i].origin[j] -
					surf.plane.normal[j] * dist;
		}

		local[0] = vec.dotProduct (impact, tex.vecs[0]) + tex.vecs[0][3];
		local[1] = vec.dotProduct (impact, tex.vecs[1]) + tex.vecs[1][3];

		local[0] -= surf.texturemins[0];
		local[1] -= surf.texturemins[1];

		//johnfitz -- lit support via lordhavoc
		var bl = state.blocklights;
		var cred = cl.state.dlights[i].color[0] * 256.0;
		var cgreen = cl.state.dlights[i].color[1] * 256.0;
		var cblue = cl.state.dlights[i].color[2] * 256.0;
		//johnfitz
		for (var t = 0; t < tmax; t++)
		{
			td = local[1] - t << 4;
			if (td < 0)
				td = -td;
			td = Math.floor(td)
			for (var s = 0 ; s < smax ; s++)
			{
				sd = local[0] - s << 4;
				if (sd < 0)
					sd = -sd;
				sd = Math.floor(sd)
				if (sd > td)
					dist = sd + (td>>1);
				else
					dist = td + (sd>>1);
				if (dist < minlight)
				//johnfitz -- lit support via lordhavoc
				{
					brightness = rad - dist;
					blidx = t * smax + s * 3
					bl[blidx] += Math.floor(brightness * cred);
					bl[blidx + 1] += Math.floor(brightness * cgreen);
					bl[blidx + 2] += Math.floor(brightness * cblue);
				}
				//johnfitz
			}
		}
	}
}
export const buildLightmaps = (gl: WebGLRenderingContext, model) => {

	//johnfitz -- null out array (the gltexture objects themselves were already freed by Mod_ClearAll)
	
	// for (var i=0; i < MAXLIGHTMAPS; i++)
	// 	txState.lightmap_textures[i] = null;

	//johnfitz

	state.lightmap_bytes = 4 // hardcoded for gl.RGBA

	// for (j=1 ; j<MAX_MODELS ; j++)
	// {
	// 	m = cl.model_precache[j];
	// 	if (!m)
	// 		break;
	// 	if (m->name[0] == '*')
	// 		continue;
	//	r_pcurrentvertbase = model.vertexes; // bs 
	//	currentmodel = m;
		for (var i=0 ; i<model.numfaces ; i++)
		{
			//johnfitz -- rewritten to use SURF_DRAWTILED instead of the sky/water flags
			// if (model.faces[i].flags & defs.SURF.drawtiled)
			// 	continue;
			createSurfaceLightmap (model, model.faces[i]);
			//johnfitz
		}
	//}

	//
	// upload all lightmaps that were filled
	//
	for (i = 0; i<MAXLIGHTMAPS; i++)
	{
		if (!state.allocated[i][0])
			break;		// no more used
		state.lightmap_modified[i] = false;
		state.lightmap_rectchange[i].l = LM_BLOCK_WIDTH;
		state.lightmap_rectchange[i].t = LM_BLOCK_HEIGHT;
		state.lightmap_rectchange[i].w = 0;
		state.lightmap_rectchange[i].h = 0;

		//johnfitz -- use texture manager
		const name = `lightmap#${i}`
		const lightmapSize = LM_BLOCK_WIDTH * LM_BLOCK_HEIGHT * state.lightmap_bytes
		const data = state.lightmaps.subarray(lightmapSize * i, lightmapSize * i + lightmapSize)

		loadLightmapTexture(gl, i, name, LM_BLOCK_WIDTH, LM_BLOCK_HEIGHT, data)
		//johnfitz
	}

	//johnfitz -- warn about exceeding old limits
	if (i >= 64)
		console.log (`%i lightmaps exceeds standard limit of 64 (max = ${MAXLIGHTMAPS}).\n`, i);
	//johnfitz
}

const buildLightMap = (model, surf, buffofs: number, stride: number) => {
	// surf.cached_dlight = surf.dlightframe === state.framecount

	const smax = (surf.extents[0]>>4)+1;
	const tmax = (surf.extents[1]>>4)+1;
	const size = smax * tmax;
	var blockidx = 0

	if (model) //if (cl.worldmodel->lightdata)
	{
		state.blocklights.fill(0)

		// add all the lightmaps
		if (surf.lightofs > -1)
		{
			for (var maps = 0; maps < surf.styles.length && surf.styles[maps] !== 255;
				 maps++)
			{
				const scale = state.lightstylevalue[surf.styles[maps]];
				surf.cached_light[maps] = scale;	// 8.8 fraction

				blockidx = 0
				//johnfitz -- lit support via lordhavoc

				for (var i = 0; i < size; i++)
				{
					const rgbVal = model.lightdata[surf.lightofs + i + (size * maps)] * scale;

					state.blocklights[blockidx++] += rgbVal
					state.blocklights[blockidx++] += rgbVal
					state.blocklights[blockidx++]	+= rgbVal
				}

				//johnfitz
			}
		}

		// add all the dynamic lights
		if (surf.dlightframe == state.framecount)
			addDynamicLights (model, surf);
	}
	else
	{
		// set to full bright if no light data
		state.blocklights.fill(255)
	}

	// case GL_RGBA:
	stride -= smax * 4;
	blockidx = 0
	
	var buffidx = buffofs
	var r, g, b
	for (var i=0 ; i<tmax ; i++, buffidx += stride)
	{
		for (var j=0 ; j<smax ; j++)
		{
			if (0)//cvr.gl_overbright.value)
			{
				r = state.blocklights[blockidx++] >> 8;
				g = state.blocklights[blockidx++] >> 8;
				b = state.blocklights[blockidx++] >> 8;
			}
			else
			{
				r = state.blocklights[blockidx++] >> 7;
				g = state.blocklights[blockidx++] >> 7;
				b = state.blocklights[blockidx++] >> 7;
			}
			state.lightmaps[buffidx++] 	= (r > 255)? 255 : r;
			state.lightmaps[buffidx++] 	= (g > 255)? 255 : g;
			state.lightmaps[buffidx++] 	= (b > 255)? 255 : b;
			state.lightmaps[buffidx++] 	= 255;
		}
	}
}

// Dynamic lights
// const uploadLightmap = (gl: WebGLRenderingContext, lmapIdx: number) => {

// 	if (!state.lightmap_modified[lmapIdx])
// 		return;

// 	state.lightmap_modified[lmapIdx] = false
	
// 	debugger

// 	const theRect = state.lightmap_rectchange[lmapIdx]
// 	const lightmap = state.lightmaps.subarray((lmapIdx * LM_BLOCK_HEIGHT + theRect.t) * LM_BLOCK_WIDTH * state.lightmap_bytes)
// 	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, theRect.t, LM_BLOCK_WIDTH, theRect.h, gl.RGBA, gl.UNSIGNED_BYTE, lightmap);
// 	theRect.l = LM_BLOCK_WIDTH;
// 	theRect.t = LM_BLOCK_HEIGHT;
// 	theRect.h = 0;
// 	theRect.w = 0;

// 	// rs_dynamiclightmaps++; // stats
// }
// const uploadLightmaps = (gl: WebGLRenderingContext) => {
// 	for (var lmapIdx = 0; lmapIdx < MAXLIGHTMAPS; lmapIdx++)
// 	{
// 		if (!state.lightmap_modified[lmapIdx])
// 			continue;

// 		bind (gl, 0, txState.lightmap_textures[lmapIdx].texnum);
// 		uploadLightmap(gl, lmapIdx);
// 	}
// }



/*
=============
R_MarkLights -- johnfitz -- rewritten to use LordHavoc's lighting speedup
=============
*/
// export const markLights (dlight_t *light, int num, mnode_t *node)
// {
// 	mplane_t	*splitplane;
// 	msurface_t	*surf;
// 	vec3_t		impact;
// 	float		dist, l, maxdist;
// 	int			i, j, s, t;

// start:

// 	if (node->contents < 0)
// 		return;

// 	splitplane = node->plane;
// 	if (splitplane->type < 3)
// 		dist = light->origin[splitplane->type] - splitplane->dist;
// 	else
// 		dist = DotProduct (light->origin, splitplane->normal) - splitplane->dist;

// 	if (dist > light->radius)
// 	{
// 		node = node->children[0];
// 		goto start;
// 	}
// 	if (dist < -light->radius)
// 	{
// 		node = node->children[1];
// 		goto start;
// 	}

// 	maxdist = light->radius*light->radius;
// // mark the polygons
// 	surf = cl.worldmodel->surfaces + node->firstsurface;
// 	for (i=0 ; i<node->numsurfaces ; i++, surf++)
// 	{
// 		for (j=0 ; j<3 ; j++)
// 			impact[j] = light->origin[j] - surf->plane->normal[j]*dist;
// 		// clamp center of light to corner and check brightness
// 		l = DotProduct (impact, surf->texinfo->vecs[0]) + surf->texinfo->vecs[0][3] - surf->texturemins[0];
// 		s = l+0.5;if (s < 0) s = 0;else if (s > surf->extents[0]) s = surf->extents[0];
// 		s = l - s;
// 		l = DotProduct (impact, surf->texinfo->vecs[1]) + surf->texinfo->vecs[1][3] - surf->texturemins[1];
// 		t = l+0.5;if (t < 0) t = 0;else if (t > surf->extents[1]) t = surf->extents[1];
// 		t = l - t;
// 		// compare to minimum light
// 		if ((s*s+t*t+dist*dist) < maxdist)
// 		{
// 			if (surf->dlightframe != r_dlightframecount) // not dynamic until now
// 			{
// 				surf->dlightbits[num >> 5] = 1U << (num & 31);
// 				surf->dlightframe = r_dlightframecount;
// 			}
// 			else // already dynamic
// 				surf->dlightbits[num >> 5] |= 1U << (num & 31);
// 		}
// 	}

// 	if (node->children[0]->contents >= 0)
// 		R_MarkLights (light, num, node->children[0]);
// 	if (node->children[1]->contents >= 0)
// 		R_MarkLights (light, num, node->children[1]);
// }
