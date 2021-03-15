"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = {
    token: '',
    data: ''
};
exports.parse = function (data) {
    exports.state.token = '';
    var i = 0, c;
    if (data.length === 0)
        return;
    var skipwhite = true;
    for (;;) {
        if (skipwhite !== true)
            break;
        skipwhite = false;
        for (;;) {
            if (i >= data.length)
                return;
            c = data.charCodeAt(i);
            if (c > 32)
                break;
            ++i;
        }
        if ((c === 47) && (data.charCodeAt(i + 1) == 47)) {
            for (;;) {
                if ((i >= data.length) || (data.charCodeAt(i) === 10))
                    break;
                ++i;
            }
            skipwhite = true;
        }
    }
    if (c === 34) {
        ++i;
        for (;;) {
            c = data.charCodeAt(i);
            ++i;
            if ((i >= data.length) || (c === 34))
                return data.substring(i);
            exports.state.token += String.fromCharCode(c);
        }
    }
    for (;;) {
        if ((i >= data.length) || (c <= 32))
            break;
        exports.state.token += String.fromCharCode(c);
        ++i;
        c = data.charCodeAt(i);
    }
    return data.substring(i);
};
//# sourceMappingURL=parse.js.map