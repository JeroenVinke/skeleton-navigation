"use strict";
exports.__esModule = true;
var transformers = [
    require('./template')["default"],
    require('./title')["default"],
    require('./styles')["default"],
    require('./preboot')["default"],
    require('./minify')["default"]
];
function transform(html, transformerCtx, options) {
    for (var i = 0; i < transformers.length; i++) {
        html = transformers[i](html, transformerCtx, options);
    }
    return html;
}
exports.transform = transform;
