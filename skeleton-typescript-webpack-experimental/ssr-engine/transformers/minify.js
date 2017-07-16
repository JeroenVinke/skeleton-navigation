"use strict";
exports.__esModule = true;
var html_minifier_1 = require("html-minifier");
function default_1(html, transformerCtx, options) {
    if (options.minifyHtml) {
        return html_minifier_1.minify(html, Object.assign({
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        }, options.minifyOptions));
    }
    return html;
}
exports["default"] = default_1;
;
