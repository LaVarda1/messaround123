"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
const common_1 = require("./common");
const c = {
    parseState: parse_1.state
};
const DEFAULT_DENSITY = 0.0;
const DEFAULT_GRAY = 0.3;
const clamp = (min, v, max) => {
    return v < min ? min : v > max ? max : v;
};
exports.state = {
    density: DEFAULT_DENSITY,
    color: {
        red: DEFAULT_GRAY,
        green: DEFAULT_GRAY,
        blue: DEFAULT_GRAY
    },
    transition: {
        density: 0,
        color: {
            red: 0,
            green: 0,
            blue: 0
        }
    },
    fade_time: 0,
    fade_done: 0
};
/*
=============
Fog_ParseWorldspawn

called at map load
=============
*/
exports.init = (worldModel) => {
    exports.state.density = DEFAULT_DENSITY;
    exports.state.color.red = DEFAULT_GRAY;
    exports.state.color.green = DEFAULT_GRAY;
    exports.state.color.blue = DEFAULT_GRAY;
    var key, value, data;
    data = parse_1.parse(worldModel.entities);
    if (!data)
        return; // error
    if (parse_1.state.token[0] !== '{')
        return; // error
    while (1) {
        data = parse_1.parse(data);
        if (!data)
            return; // error
        if (c.parseState.token[0] === '}')
            break; // end of worldspawn
        if (c.parseState.token[0] === '_')
            key = parse_1.state.token.substr(1);
        else
            key = parse_1.state.token;
        key = key.trim();
        data = parse_1.parse(data);
        if (!data)
            return; // error
        value = parse_1.state.token;
        if (key === 'fog') {
            const split = value.split(' ');
            if (split.length === 4) {
                exports.state.density = common_1.atof(split[0]);
                exports.state.color.red = common_1.atof(split[1]);
                exports.state.color.green = common_1.atof(split[2]);
                exports.state.color.blue = common_1.atof(split[3]);
            }
            else {
                console.log(`Map has invalid fog value ${value}`);
            }
        }
    }
};
// /*
// =============
// Fog_GetColor
// calculates fog color for this frame, taking into account fade times
// =============
// */
// export const getColor = () => {
//   var c = []
//   if (state.fade_done > cl.clState.time) {
//     var f = (state.fade_done - cl.clState.time) / state.fade_time;
//     c[0] = f * state.transition.color.red + (1.0 - f) * state.color.red;
//     c[1] = f * state.transition.color.green + (1.0 - f) * state.color.green;
//     c[2] = f * state.transition.color.blue + (1.0 - f) * state.color.blue;
//     c[3] = 1.0;
//   }
//   else {
//     c[0] = state.color.red;
//     c[1] = state.color.green;
//     c[2] = state.color.blue;
//     c[3] = 1.0;
//   }
//   // find closest 24-bit RGB value, so solid-colored sky can match the fog perfectly
//   for (var i = 0; i < 3; i++)
//     c[i] = (Math.ceil(c[i] * 255)) / 255;
//   return c;
// }
// /*
// =============
// Fog_GetDensity
// returns current density of fog
// =============
// */
// export const getDensity = () => {
//   if (state.fade_done > cl.clState.time) {
//     var f = (state.fade_done - cl.clState.time) / state.fade_time;
//     return f * state.transition.density + (1.0 - f) * state.density;
//   }
//   else
//     return state.density;
// }
//# sourceMappingURL=fog.js.map