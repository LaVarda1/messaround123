"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import {draw as drawInterface} from './userInterface'
const scene_1 = require("./wfqbsp/scene");
const camera_1 = require("./wfqbsp/camera");
const glstate_1 = require("./glstate");
exports.fps = 0;
let isLooping = false;
var lastFrame = 0;
var state = {
    lastFrame: 0,
    isLooping: false,
    cameraWobble: true,
    sampleInput: false,
    time: 0.0
};
const render = () => {
    state.time = Date.now() * 0.001;
    // var width = (dom.docEl.clientWidth <= 320) ? 320 : dom.docEl.clientWidth;
    // var height = (dom.docEl.clientHeight <= 200) ? 200 : dom.docEl.clientHeight;
    // dom.canvas.width = width
    // dom.canvas.height = height
    if (state.sampleInput) {
        camera_1.sampleInput();
    }
    if (state.cameraWobble) {
        camera_1.doWobble(state.time);
    }
    /* Step5: Drawing the requi red object (triangle) */
    // Clear the canvas
    glstate_1.gl.clearColor(0, 0, 0, 1);
    //gl.cullFace(gl.FRONT);
    glstate_1.gl.blendFuncSeparate(glstate_1.gl.SRC_ALPHA, glstate_1.gl.ONE_MINUS_SRC_ALPHA, glstate_1.gl.ONE, glstate_1.gl.ONE);
    // Enable the depth test
    //gl.enable(gl.DEPTH_TEST); 
    // Clear the color buffer bit
    glstate_1.gl.clear(glstate_1.gl.COLOR_BUFFER_BIT);
    // Set the view port
    glstate_1.gl.viewport(0, 0, glstate_1.dom.canvas.width, glstate_1.dom.canvas.height);
    scene_1.draw(glstate_1.gl);
    // drawTutorial(gl)
    //drawInterface(gl)
};
const loop = () => {
    if (!isLooping) {
        return;
    }
    const thisFrame = new Date().getTime();
    const diff = thisFrame - lastFrame;
    lastFrame = thisFrame;
    exports.fps = 1000 / diff;
    render();
    setTimeout(loop, 30);
};
exports.start = (options) => {
    state.cameraWobble = options.cameraWobble;
    state.sampleInput = options.sampleInput;
    isLooping = true;
    setTimeout(loop, 1);
};
exports.stop = () => {
    isLooping = false;
};
//# sourceMappingURL=renderLoop.js.map