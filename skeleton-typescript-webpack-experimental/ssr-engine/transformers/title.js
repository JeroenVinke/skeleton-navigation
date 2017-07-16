"use strict";
exports.__esModule = true;
function default_1(html, transformerCtx, options) {
    var title = transformerCtx.document.head.querySelector('title');
    return html.replace('<!-- title -->', title.innerHTML);
}
exports["default"] = default_1;
;
