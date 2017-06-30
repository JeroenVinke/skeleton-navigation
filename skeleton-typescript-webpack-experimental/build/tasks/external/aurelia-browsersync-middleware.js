"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_ssr_renderer_1 = require("./aurelia-ssr-renderer");
function aureliaBrowserSyncMiddleware(renderOptions) {
    return function (req, res, next) {
        var pathname = req.originalUrl;
        // skip requests where urls have an extension
        var extensionMatcher = /^.*\.[^\\]+$/;
        if (pathname.match(extensionMatcher)) {
            return next();
        }
        return aurelia_ssr_renderer_1.render(Object.assign({ route: pathname }, renderOptions))
            .then(function (html) {
            // just to indicate when server-view is active
            html = html.replace('collapse navbar-collapse', 'collapse navbar-collapse green');
            res.write(html);
        })
            .catch(function (e) {
            res.write("<html><body>Failed to render " + pathname + "</body></html>");
            console.log("Failed to render " + pathname);
            console.log(e);
        })
            .then(res.end);
    };
}
exports.aureliaBrowserSyncMiddleware = aureliaBrowserSyncMiddleware;
;
