"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderLoop_1 = require("./renderLoop");
// import {init as initUserInterface} from './userInterface'
const glstate_1 = require("./glstate");
const bsp_1 = require("./wfqbsp/bsp");
const scene_1 = require("./wfqbsp/scene");
exports.init = async (dom, bspUrl, palleteUrl, options) => {
    glstate_1.init(dom);
    // await initUserInterface(gl)
    await bsp_1.init(glstate_1.gl, bspUrl, palleteUrl);
    scene_1.init(glstate_1.gl);
    renderLoop_1.start(options);
};
exports.free = async () => {
    scene_1.free(glstate_1.gl);
};
//# sourceMappingURL=main.js.map