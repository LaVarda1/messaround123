"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array8to24 = new Uint32Array(new ArrayBuffer(1024));
exports.setPallet = async (palletData) => {
    var pal = new Uint8Array(palletData);
    var src = 0;
    for (var i = 0; i < 256; ++i) {
        exports.array8to24[i] = pal[src] + (pal[src + 1] << 8) + (pal[src + 2] << 16);
        src += 3;
    }
};
//# sourceMappingURL=pallete.js.map