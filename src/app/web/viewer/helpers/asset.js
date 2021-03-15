"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mem_1 = require("./mem");
exports.loadBinary = (url) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text\/plain; charset=x-user-defined');
    xhr.open('GET', url);
    xhr.onload = () => {
        resolve(mem_1.strmem(xhr.responseText));
    };
    xhr.onerror = (e) => reject(e);
    xhr.send();
});
exports.loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = e => reject(e);
        img.src = url;
    });
};
//# sourceMappingURL=asset.js.map