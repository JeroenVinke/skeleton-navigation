"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_ssr_renderer_1 = require("./aurelia-ssr-renderer");
exports.aureliaKoaMiddleware = function (renderOptions) {
    return function (ctx, next) {
        var pathname = ctx.request.URL.pathname;
        // skip requests where urls have an extension
        var extensionMatcher = /^.*\.[^\\]+$/;
        if (pathname.match(extensionMatcher)) {
            return next();
        }
        return aurelia_ssr_renderer_1.render(Object.assign({ route: pathname }, renderOptions))
            .then(function (html) {
            ctx.body = html;
        })
            .catch(function (e) {
            ctx.body = "<html><body>Failed to render " + pathname + "</body></html>";
            console.log("Failed to render " + pathname);
            console.log(e);
        });
    };
};
