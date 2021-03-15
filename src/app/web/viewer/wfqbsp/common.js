"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
exports.CONTENTS = {
    empty: -1,
    solid: -2,
    water: -3,
    slime: -4,
    lava: -5,
    sky: -6,
    origin: -7,
    clip: -8,
    current_0: -9,
    current_90: -10,
    current_180: -11,
    current_270: -12,
    current_up: -13,
    current_down: -14
};
exports.identity = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
exports.littleLong = (() => {
    var swaptest = new ArrayBuffer(2);
    var swaptestview = new Uint8Array(swaptest);
    swaptestview[0] = 1;
    swaptestview[1] = 0;
    if ((new Uint16Array(swaptest))[0] === 1)
        return l => l;
    else
        return l => (l >>> 24) + ((l & 0xff0000) >>> 8) + (((l & 0xff00) << 8) >>> 0) + ((l << 24) >>> 0);
})();
exports.bufferGrow = (oldBuffer, newSize) => {
    const newBuffer = new ArrayBuffer(newSize);
    const oldByteAccess = new Uint8Array(oldBuffer);
    const newByteAccess = new Uint8Array(newBuffer);
    for (var i = 0; i < oldBuffer.byteLength; i++) {
        newByteAccess[i] = oldByteAccess[i];
    }
    return newBuffer;
};
exports.radiusFromBounds = (mins, maxs) => vector_1.length([
    Math.abs(mins[0]) > Math.abs(maxs[0]) ? Math.abs(mins[0]) : Math.abs(maxs[0]),
    Math.abs(mins[1]) > Math.abs(maxs[1]) ? Math.abs(mins[1]) : Math.abs(maxs[1]),
    Math.abs(mins[2]) > Math.abs(maxs[2]) ? Math.abs(mins[2]) : Math.abs(maxs[2])
]);
exports.atof = function (str) {
    if (str == null)
        return 0.0;
    var ptr, val, sign, c, c2;
    if (str.charCodeAt(0) === 45) {
        sign = -1.0;
        ptr = 1;
    }
    else {
        sign = 1.0;
        ptr = 0;
    }
    c = str.charCodeAt(ptr);
    c2 = str.charCodeAt(ptr + 1);
    if ((c === 48) && ((c2 === 120) || (c2 === 88))) {
        ptr += 2;
        val = 0.0;
        for (;;) {
            c = str.charCodeAt(ptr++);
            if ((c >= 48) && (c <= 57))
                val = (val * 16.0) + c - 48;
            else if ((c >= 97) && (c <= 102))
                val = (val * 16.0) + c - 87;
            else if ((c >= 65) && (c <= 70))
                val = (val * 16.0) + c - 55;
            else
                return val * sign;
        }
    }
    if (c === 39) {
        if (this.isNaN(c2) === true)
            return 0.0;
        return sign * c2;
    }
    val = parseFloat(str);
    if (Number.isNaN(val))
        return 0.0;
    return val;
};
//# sourceMappingURL=common.js.map