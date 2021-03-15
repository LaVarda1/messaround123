"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entitiesParser_1 = require("./entitiesParser");
exports.entities = [];
exports.init = (model) => {
    exports.entities = entitiesParser_1.parseEntities(model.entities);
};
//# sourceMappingURL=entities.js.map