"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const pallete_1 = require("./pallete");
exports.state = {
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
};
const resampleTexture = function (data, inwidth, inheight, outwidth, outheight) {
    var outdata = new ArrayBuffer(outwidth * outheight);
    var out = new Uint8Array(outdata);
    var xstep = inwidth / outwidth, ystep = inheight / outheight;
    var src, dest = 0, y;
    var i, j;
    for (i = 0; i < outheight; ++i) {
        src = Math.floor(i * ystep) * inwidth;
        for (j = 0; j < outwidth; ++j)
            out[dest + j] = data[src + Math.floor(j * xstep)];
        dest += outwidth;
    }
    return out;
};
exports.loadSky = (gl, src) => {
    var i, j, p;
    var trans = new ArrayBuffer(65536);
    var trans32 = new Uint32Array(trans);
    for (i = 0; i < 128; ++i) {
        for (j = 0; j < 128; ++j)
            trans32[(i << 7) + j] = common_1.littleLong(pallete_1.array8to24[src[(i << 8) + j + 128]] + 0xff000000);
    }
    exports.bind(gl, 0, exports.state.solidskytexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
    gl.generateMipmap(gl.TEXTURE_2D);
    for (i = 0; i < 128; ++i) {
        for (j = 0; j < 128; ++j) {
            p = (i << 8) + j;
            if (src[p] !== 0)
                trans32[(i << 7) + j] = common_1.littleLong(pallete_1.array8to24[src[p]] + 0xff000000);
            else
                trans32[(i << 7) + j] = 0;
        }
    }
    exports.bind(gl, 0, exports.state.alphaskytexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
    gl.generateMipmap(gl.TEXTURE_2D);
};
exports.init = (gl) => {
    exports.state.filter_min = gl.LINEAR_MIPMAP_NEAREST;
    exports.state.filter_max = gl.LINEAR;
    exports.state.maxtexturesize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var data = new Uint8Array(new ArrayBuffer(256));
    var i, j;
    for (i = 0; i < 8; ++i) {
        for (j = 0; j < 8; ++j) {
            data[(i << 4) + j] = data[136 + (i << 4) + j] = 255;
            data[8 + (i << 4) + j] = data[128 + (i << 4) + j] = 0;
        }
    }
    exports.state.notexture_mip = { name: 'notexture', width: 16, height: 16, texturenum: gl.createTexture(), texturechains: [null, null] };
    exports.bind(gl, 0, exports.state.notexture_mip.texturenum);
    exports.upload(gl, data, 16, 16);
    exports.state.solidskytexture = gl.createTexture();
    exports.bind(gl, 0, exports.state.solidskytexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    exports.state.alphaskytexture = gl.createTexture();
    exports.bind(gl, 0, exports.state.alphaskytexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    exports.state.lightmap_textures = [];
    for (i = 0; i < 4; i++) {
        exports.state.lightmap_textures[i] = gl.createTexture();
        exports.bind(gl, 0, exports.state.lightmap_textures[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    exports.state.lightstyle_texture = gl.createTexture();
    exports.bind(gl, 0, exports.state.lightstyle_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    exports.state.fullbright_texture = gl.createTexture();
    exports.bind(gl, 0, exports.state.fullbright_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    exports.state.null_texture = gl.createTexture();
    exports.bind(gl, 0, exports.state.null_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
};
exports.bind = (gl, target, texnum) => {
    if (exports.state.currenttextures[target] !== texnum) {
        if (exports.state.activetexture !== target) {
            exports.state.activetexture = target;
            gl.activeTexture(gl.TEXTURE0 + target);
        }
        exports.state.currenttextures[target] = texnum;
        gl.bindTexture(gl.TEXTURE_2D, texnum);
    }
};
exports.upload = function (gl, data, width, height) {
    var scaled_width = width, scaled_height = height;
    if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0)) {
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
    if (scaled_width > exports.state.maxtexturesize)
        scaled_width = exports.state.maxtexturesize;
    if (scaled_height > exports.state.maxtexturesize)
        scaled_height = exports.state.maxtexturesize;
    if ((scaled_width !== width) || (scaled_height !== height))
        data = resampleTexture(data, width, height, scaled_width, scaled_height);
    var trans = new ArrayBuffer((scaled_width * scaled_height) << 2);
    var trans32 = new Uint32Array(trans);
    for (var i = scaled_width * scaled_height - 1; i >= 0; --i) {
        trans32[i] = common_1.littleLong(pallete_1.array8to24[data[i]] + 0xff000000);
        if (data[i] >= 224)
            trans32[i] &= 0xffffff;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scaled_width, scaled_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, exports.state.filter_min);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, exports.state.filter_max);
};
exports.loadTexture = (gl, identifier, width, height, data, flags = 0) => {
    var glt, i;
    if (identifier.length !== 0) {
        for (i = 0; i < exports.state.textures.length; ++i) {
            glt = exports.state.textures[i];
            if (glt.identifier === identifier) {
                if ((width !== glt.width) || (height !== glt.height))
                    console.log('GL.LoadTexture: cache mismatch');
                return glt;
            }
        }
    }
    var scaled_width = width, scaled_height = height;
    if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0)) {
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
    if (scaled_width > exports.state.maxtexturesize)
        scaled_width = exports.state.maxtexturesize;
    if (scaled_height > exports.state.maxtexturesize)
        scaled_height = exports.state.maxtexturesize;
    scaled_width >>= 0; // TODO cvr.picmip.value;
    if (scaled_width === 0)
        scaled_width = 1;
    scaled_height >>= 0; // TODO cvr.picmip.value;
    if (scaled_height === 0)
        scaled_height = 1;
    if ((scaled_width !== width) || (scaled_height !== height))
        data = resampleTexture(data, width, height, scaled_width, scaled_height);
    glt = { texnum: gl.createTexture(), identifier: identifier, width: width, height: height };
    exports.bind(gl, 0, glt.texnum);
    exports.upload(gl, data, scaled_width, scaled_height);
    exports.state.textures[exports.state.textures.length] = glt;
    return glt;
};
exports.loadLightmapTexture = (gl, lmNum, name, width, height, data) => {
    var glt;
    glt = { texnum: gl.createTexture(), identifier: name, width: width, height: height };
    exports.bind(gl, 0, glt.texnum);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    exports.state.lightmap_textures[lmNum] = glt;
    return glt;
};
exports.freeTexture = (gl, glt) => {
    gl.deleteTexture(glt.texnum);
};
exports.freeTextures = (gl) => {
    for (var i = exports.state.textures.length - 1; i >= 0; i--) {
        const texture = exports.state.textures[i];
        exports.freeTexture(gl, texture);
        exports.state.textures.splice(i, 1);
    }
};
//# sourceMappingURL=textures.js.map