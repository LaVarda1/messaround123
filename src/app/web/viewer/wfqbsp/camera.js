"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glstate_1 = require("../glstate");
const vector_1 = require("./vector");
const bindings = {
    ArrowUp: 'FORWARD',
    ArrowDown: 'BACK',
    Space: 'MOVEUP',
    KeyC: 'MOVEDOWN',
    ArrowLeft: 'TURNLEFT',
    ArrowRight: 'TURNRIGHT'
};
exports.state = {
    origin: [0, 0, 0],
    angles: [0, 0, 0],
    maxSpeed: 600,
    keyedState: {}
};
const move = (forwardMove, sideMove) => {
    var forward = [], right = [];
    vector_1.angleVectors(exports.state.angles, forward, right, null);
    var fmove = forwardMove;
    var smove = sideMove;
    var wishvel = [
        forward[0] * fmove + right[0] * smove,
        forward[1] * fmove + right[1] * smove,
        0.0
    ];
    var wishdir = [wishvel[0], wishvel[1], wishvel[2]], wishspeed = vector_1.normalize(wishdir);
    var scaler = (exports.state.maxSpeed / wishspeed);
    if (wishspeed > exports.state.maxSpeed) {
        wishvel[0] = wishvel[0] * scaler;
        wishvel[1] = wishvel[1] * scaler;
        wishvel[2] = wishvel[2] * scaler;
        wishspeed = exports.state.maxSpeed;
    }
    const newOrigin = [
        exports.state.origin[0] + wishvel[0],
        exports.state.origin[1] + wishvel[1],
        exports.state.origin[2] + wishvel[2],
    ];
    exports.state.origin = newOrigin;
};
const keydown = (e) => {
    console.log('keydown ' + e.code);
    if (bindings[e.code]) {
        exports.state.keyedState[bindings[e.code]] = true;
    }
};
const keyUp = (e) => {
    console.log('keyup ' + e.code);
    if (exports.state.keyedState[bindings[e.code]]) {
        exports.state.keyedState[bindings[e.code]] = false;
    }
};
exports.sampleInput = () => {
    const input = Object.keys(exports.state.keyedState).filter(key => !!exports.state.keyedState[key]);
    for (var i = 0; i < input.length; i++) {
        switch (input[i]) {
            case 'FORWARD':
                //state.origin[0] += 3;
                move(3, 0);
                break;
            case 'BACK':
                move(-3, 0);
                break;
            case 'MOVEUP':
                exports.state.origin[2] += 3;
                break;
            case 'MOVEDOWN':
                exports.state.origin[2] -= 3;
                break;
            case 'TURNLEFT':
                exports.state.angles[1] += 3;
                break;
            case 'TURNRIGHT':
                exports.state.angles[1] -= 3;
                break;
        }
    }
};
exports.doWobble = (time) => {
    const _time = time / 5;
    exports.state.angles[0] = Math.sin(_time) * 3;
    exports.state.angles[1] = 45 + Math.sin(_time * 2) * 3;
    exports.state.angles[2] = Math.sin(_time * .5) * 1;
};
exports.setOrigin = (origin) => {
    exports.state.origin = origin;
};
exports.setAngles = (angles) => {
    exports.state.angles = angles;
};
exports.init = () => {
    glstate_1.dom.addEventHandler('keydown', keydown);
    glstate_1.dom.addEventHandler('keyup', keyUp);
};
//# sourceMappingURL=camera.js.map