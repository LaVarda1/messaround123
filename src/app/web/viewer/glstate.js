"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gl = null;
exports.dom = null;
const onError = (err, fnName, args) => {
    console.log('GL ERROR ' + fnName);
};
exports.init = (_dom) => {
    exports.dom = _dom;
    const context = exports.dom.canvas.getContext('webgl2') || exports.dom.canvas.getContext('experimental-webgl2');
    //gl = WebGLDebugUtils.default.makeDebugContext(context, onError, null, null)
    exports.gl = context;
};
//# sourceMappingURL=glstate.js.map