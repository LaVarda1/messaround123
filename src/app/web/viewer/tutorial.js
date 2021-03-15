"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("./shader/code");
exports.draw = (gl) => {
    /* Step2: Define the geometry and store it in buffer objects */
    var vertices = [
        -0.5, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];
    // Create a new buffer object
    var vertex_buffer = gl.createBuffer();
    // Bind an empty array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertices data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    /* Step3: Create and compile Shader programs */
    // Vertex shader source code
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, code_1.vertex);
    gl.compileShader(vertShader);
    //Fragment shader source code
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, code_1.fragment);
    gl.compileShader(fragShader);
    // Create a shader program object to store combined shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    //Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    //point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    //Enable the attribute
    gl.enableVertexAttribArray(coord);
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};
//# sourceMappingURL=tutorial.js.map