"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strmem = (src) => {
    const buf = new ArrayBuffer(src.length);
    const dest = new Uint8Array(buf);
    for (var i = 0; i < src.length; ++i)
        dest[i] = src.charCodeAt(i) & 255;
    return buf;
};
exports.memstr = (src) => {
    var dest = [], i;
    for (i = 0; i < src.length; ++i) {
        if (src[i] === 0)
            break;
        dest[i] = String.fromCharCode(src[i]);
    }
    return dest.join('');
};
//# sourceMappingURL=mem.js.map