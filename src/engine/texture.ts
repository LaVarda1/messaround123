import {state as comState} from './com'
import { d_8to24table, d_8to24table_fbright_fence, d_8to24table_fbright, 
  d_8to24table_conchars, d_8to24table_nobright, d_8to24table_nobright_fence
} from './pallete'
import * as defs from './def'
import * as GL from './GL'
import * as con from './console'

export const state = {
  maxtexturesize: -1,
  activetexture: -1,
  currenttextures: [],
  filter_max: -1,
  filter_min: -1,
  textures: [],
  notexture_mip: null,
  solidskytexture: null,
  alphaskytexture: null,
  lightmap_textures: [],
  lightstyle_texture: null,
  null_texture: null,
  fullbright_texture: null
}

const resampleTexture = function(data, inwidth, inheight, outwidth, outheight)
{
  var outdata = new ArrayBuffer(outwidth * outheight);
  var out = new Uint8Array(outdata);
  var xstep = inwidth / outwidth, ystep = inheight / outheight;
  var src, dest = 0, y;
  var i, j;
  for (i = 0; i < outheight; ++i)
  {
    src = Math.floor(i * ystep) * inwidth;
    for (j = 0; j < outwidth; ++j)
      out[dest + j] = data[src + Math.floor(j * xstep)];
    dest += outwidth;
  }
  return out;
}

export const loadSky = (gl: WebGLRenderingContext, src) => {
	var i, j, p;
	var trans = new ArrayBuffer(65536);
	var trans32 = new Uint32Array(trans);

	for (i = 0; i < 128; ++i)
	{
		for (j = 0; j < 128; ++j)
			trans32[(i << 7) + j] = comState.littleLong(d_8to24table[src[(i << 8) + j + 128]]);
	}
  bind(gl, 0, state.solidskytexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
  gl.generateMipmap(gl.TEXTURE_2D);

  for (i = 0; i < 128; ++i)
  {
    for (j = 0; j < 128; ++j)
    {
      p = (i << 8) + j;
      if (src[p] !== 0)
        trans32[(i << 7) + j] = comState.littleLong(d_8to24table[src[p]]);
      else
        trans32[(i << 7) + j] = 0;
    }
  }
  bind(gl, 0, state.alphaskytexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
  gl.generateMipmap(gl.TEXTURE_2D);
}

export const init = () => {
  const gl = GL.getContext()
  state.filter_min = gl.LINEAR_MIPMAP_NEAREST
  state.filter_max = gl.LINEAR
  state.maxtexturesize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	var data = new Uint8Array(new ArrayBuffer(256));
	var i, j;
	for (i = 0; i < 8; ++i)
	{
		for (j = 0; j < 8; ++j)
		{
			data[(i << 4) + j] = data[136 + (i << 4) + j] = 255;
			data[8 + (i << 4) + j] = data[128 + (i << 4) + j] = 0;
		}
	}
	state.notexture_mip = {name: 'notexture', width: 16, height: 16, texturenum: gl.createTexture(), texturechains: [null, null]};
	bind(gl, 0, state.notexture_mip.texturenum);
  upload(gl, data, 16, 16);
  
	state.solidskytexture = gl.createTexture();
	bind(gl, 0, state.solidskytexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
	state.alphaskytexture = gl.createTexture();
	bind(gl, 0, state.alphaskytexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  state.lightmap_textures = []
  for (i = 0; i < 4; i++) {
    state.lightmap_textures[i] = gl.createTexture();
    bind(gl, 0, state.lightmap_textures[i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
  }
	state.lightstyle_texture = gl.createTexture();
	bind(gl, 0, state.lightstyle_texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


	state.fullbright_texture = gl.createTexture();
	bind(gl, 0, state.fullbright_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 0]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
	state.null_texture = gl.createTexture();
	bind(gl, 0, state.null_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

export const bind = (gl: WebGLRenderingContext, target: number, texnum: number) => {
  if (state.currenttextures[target] !== texnum)
  {
    if (state.activetexture !== target)
    {
      state.activetexture = target;
      gl.activeTexture(gl.TEXTURE0 + target);
    }
    state.currenttextures[target] = texnum;
    gl.bindTexture(gl.TEXTURE_2D, texnum);
  }
}

export const upload = function(gl, data, width, height, flags = 0)
{
  var scaled_width = width, scaled_height = height;
  if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0))
  {
    --scaled_width;
    scaled_width |= (scaled_width >> 1);
    scaled_width |= (scaled_width >> 2);
    scaled_width |= (scaled_width >> 4);
    scaled_width |= (scaled_width >> 8);
    scaled_width |= (scaled_width >> 16);
    ++scaled_width;
    --scaled_height;
    scaled_height |= (scaled_height >> 1);
    scaled_height |= (scaled_height >> 2);
    scaled_height |= (scaled_height >> 4);
    scaled_height |= (scaled_height >> 8);
    scaled_height |= (scaled_height >> 16);
    ++scaled_height;
  }
  if (scaled_width > state.maxtexturesize)
    scaled_width = state.maxtexturesize;
  if (scaled_height > state.maxtexturesize)
    scaled_height = state.maxtexturesize;
  if ((scaled_width !== width) || (scaled_height !== height))
    data = resampleTexture(data, width, height, scaled_width, scaled_height);
  var trans = new ArrayBuffer((scaled_width * scaled_height) << 2)
  var trans32 = new Uint32Array(trans);
  var pal = d_8to24table
  var padbyte = 255

	// choose palette and padbyte
	if (flags & defs.TEXPREF.fullbright)
	{
		if (flags & defs.TEXPREF.alpha)
			pal = d_8to24table_fbright_fence;
		else
      pal = d_8to24table_fbright;
		padbyte = 0;
	}
	else if (flags & defs.TEXPREF.nobright && false)//gl_fullbrights.value)
	{
		if (flags & defs.TEXPREF.alpha)
			pal = d_8to24table_nobright_fence;
		else
			pal = d_8to24table_nobright;
		padbyte = 0;
	}
	else if (flags & defs.TEXPREF.conchars)
	{
		pal = d_8to24table_conchars;
		padbyte = 0;
  }
  
  for (var i = scaled_width * scaled_height - 1; i >= 0; --i)
  {
    trans32[i] = comState.littleLong(pal[data[i]]);
    // if (data[i] >= 224)
    //   trans32[i] &= 0xffffff;
  }

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scaled_width, scaled_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, state.filter_min);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, state.filter_max);
}


export const loadTexture = (gl, identifier, width, height, data, flags = 0) => {
  var glt, i;
  if (identifier.length !== 0)
  {
    for (i = 0; i < state.textures.length; ++i)
    {
      glt = state.textures[i];
      if (glt.identifier === identifier)
      {
        if ((width !== glt.width) || (height !== glt.height))
          con.print('GL.LoadTexture: cache mismatch\n')
        return glt
      }
    }
  }
  
  var scaled_width = width, scaled_height = height;
  if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0))
  {
    --scaled_width ;
    scaled_width |= (scaled_width >> 1);
    scaled_width |= (scaled_width >> 2);
    scaled_width |= (scaled_width >> 4);
    scaled_width |= (scaled_width >> 8);
    scaled_width |= (scaled_width >> 16);
    ++scaled_width;
    --scaled_height;
    scaled_height |= (scaled_height >> 1);
    scaled_height |= (scaled_height >> 2);
    scaled_height |= (scaled_height >> 4);
    scaled_height |= (scaled_height >> 8);
    scaled_height |= (scaled_height >> 16);
    ++scaled_height;
  }
  if (scaled_width > state.maxtexturesize)
    scaled_width = state.maxtexturesize;
  if (scaled_height > state.maxtexturesize)
    scaled_height = state.maxtexturesize;
  scaled_width >>= 0 // TODO cvr.picmip.value;
  if (scaled_width === 0)
    scaled_width = 1;
  scaled_height >>= 0  // TODO cvr.picmip.value;
  if (scaled_height === 0)
    scaled_height = 1;
  if ((scaled_width !== width) || (scaled_height !== height))
    data = resampleTexture(data, width, height, scaled_width, scaled_height);

  glt = {texnum: gl.createTexture(), identifier: identifier, width: width, height: height};
  bind(gl, 0, glt.texnum);
  upload(gl, data, scaled_width, scaled_height, flags);
  state.textures[state.textures.length] = glt;
  return glt;
}

export const loadLightmapTexture = (gl: WebGLRenderingContext, lmNum, name, width, height, data,) => {
  var glt
  glt = {texnum: gl.createTexture(), identifier: name, width: width, height: height};
  bind(gl, 0, glt.texnum);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  state.lightmap_textures[lmNum] = glt
  return glt
}

// const loadTexture = (gl, model, name, width, height, type, data, flags) => {

// }