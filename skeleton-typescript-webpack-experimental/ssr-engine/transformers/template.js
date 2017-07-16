"use strict";
exports.__esModule = true;
function default_1(html, transformerCtx, options) {
    return options.template.replace('<!-- app -->', transformerCtx.app);
}
exports["default"] = default_1;
;
