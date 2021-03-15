"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = {
    programs: [],
    currentProgram: null
};
exports.createProgram = (gl, shader, identifier, uniforms, attribs, textures) => {
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, shader.vertex);
    gl.compileShader(vertShader);
    if (gl.getShaderParameter(vertShader, gl.COMPILE_STATUS) !== true)
        throw new Error('Error compiling shader: ' + gl.getShaderInfoLog(vertShader));
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, shader.fragment);
    gl.compileShader(fragShader);
    if (gl.getShaderParameter(fragShader, gl.COMPILE_STATUS) !== true)
        throw new Error('Error compiling shader: ' + gl.getShaderInfoLog(fragShader));
    const glHandle = gl.createProgram();
    const program = {
        glHandle,
        attribs: [],
        vertexSize: 0,
        attribBits: 0
    };
    gl.attachShader(glHandle, vertShader);
    gl.deleteShader(vertShader);
    gl.attachShader(glHandle, fragShader);
    gl.deleteShader(fragShader);
    // for ( var i = 0; i < bindings.length; i++) {
    //   gl.bindAttribLocation(glHandle, bindings[i].index, bindings[i].name)
    // }
    gl.linkProgram(glHandle);
    if (gl.getProgramParameter(glHandle, gl.LINK_STATUS) !== true)
        throw new Error('Error linking program: ' + gl.getProgramInfoLog(glHandle));
    gl.useProgram(glHandle);
    for (var i = 0; i < uniforms.length; ++i)
        program[uniforms[i]] = gl.getUniformLocation(glHandle, uniforms[i]);
    for (var i = 0; i < attribs.length; ++i) {
        var attribParameters = attribs[i];
        var attrib = {
            name: attribParameters[0],
            location: gl.getAttribLocation(glHandle, attribParameters[0]),
            type: attribParameters[1],
            components: attribParameters[2],
            normalized: (attribParameters[3] === true),
            offset: program.vertexSize
        };
        if (attribParameters[4] > -1) {
            gl.bindAttribLocation(glHandle, attribParameters[4], attrib.name);
        }
        program.attribs[i] = attrib;
        program[attrib.name] = attrib;
        if (attrib.type === gl.FLOAT)
            program.vertexSize += attrib.components * 4;
        else if (attrib.type === gl.BYTE || attrib.type === gl.UNSIGNED_BYTE)
            program.vertexSize += 4;
        else
            throw new Error('Unknown vertex attribute type');
        program.attribBits |= 1 << attrib.location;
    }
    for (var i = 0; i < textures.length; ++i) {
        program[textures[i]] = i;
        gl.uniform1i(gl.getUniformLocation(glHandle, textures[i]), i);
    }
    exports.state.programs[identifier] = program;
    return program;
};
exports.useProgram = (gl, identifier) => {
    const currentProgram = exports.state.currentProgram;
    if (currentProgram != null) {
        if (currentProgram === identifier)
            return exports.state.currentProgram;
    }
    var program = exports.state.programs[identifier];
    if (program == null)
        return null;
    var enableAttribs = program.attribBits, disableAttribs = 0;
    if (currentProgram != null) {
        enableAttribs &= ~currentProgram.attribBits;
        disableAttribs = currentProgram.attribBits & ~program.attribBits;
    }
    exports.state.currentProgram = program;
    gl.useProgram(program.glHandle);
    for (var attrib = 0; enableAttribs !== 0 || disableAttribs !== 0; ++attrib) {
        var mask = 1 << attrib;
        if ((enableAttribs & mask) !== 0)
            gl.enableVertexAttribArray(attrib);
        else if ((disableAttribs & mask) !== 0)
            gl.disableVertexAttribArray(attrib);
        enableAttribs &= ~mask;
        disableAttribs &= ~mask;
    }
    return program;
};
exports.unbindProgram = (gl) => {
    const currentProgram = exports.state.currentProgram;
    if (currentProgram == null)
        return;
    var i;
    for (i = 0; i < currentProgram.attribs.length; ++i)
        gl.disableVertexAttribArray(currentProgram.attribs[i].location);
    exports.state.currentProgram = null;
};
exports.freePrograms = (gl) => {
    for (var i = exports.state.programs.length - 1; i >= 0; i--) {
        const program = exports.state.programs[i];
        gl.deleteProgram(program.program);
        exports.state.programs.splice(i, 1);
    }
    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    for (var unit = 0; unit < numTextureUnits; ++unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var numAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    for (var attrib = 0; attrib < numAttributes; ++attrib) {
        gl.vertexAttribPointer(attrib, 1, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
//# sourceMappingURL=program.js.map