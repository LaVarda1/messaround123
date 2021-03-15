"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
const common_1 = require("./common");
const c = {
    parseState: parse_1.state
};
exports.state = {
    lava: 0,
    water: 1,
    slime: 0,
    tele: 0
};
exports.init = (worldModel) => {
    var key, value, data;
    data = parse_1.parse(worldModel.entities);
    if (!data)
        return; // error
    if (parse_1.state.token[0] != '{')
        return; // error
    while (1) {
        data = parse_1.parse(data);
        if (!data)
            return; // error
        if (c.parseState.token[0] == '}')
            break; // end of worldspawn
        if (c.parseState.token[0] == '_')
            key = parse_1.state.token.substr(1);
        else
            key = parse_1.state.token;
        key = key.trim();
        data = parse_1.parse(data);
        if (!data)
            return; // error
        value = parse_1.state.token;
        if (key === "wateralpha")
            exports.state.water = common_1.atof(value);
        if (key === "lavaalpha")
            exports.state.lava = common_1.atof(value);
        if (key === "telealpha")
            exports.state.tele = common_1.atof(value);
        if (key === "slimealpha")
            exports.state.slime = common_1.atof(value);
    }
};
//# sourceMappingURL=mapAlpha.js.map