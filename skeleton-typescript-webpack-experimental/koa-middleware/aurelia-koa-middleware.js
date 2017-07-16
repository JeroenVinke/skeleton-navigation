"use strict";
exports.__esModule = true;
exports.aureliaKoaMiddleware = function (renderOptions, initializationOptions) {
    return function (ctx, next) {
        var pathname = ctx.request.URL.pathname;
        // skip requests where urls have an extension
        var extensionMatcher = /^.*\.[^\\]+$/;
        if (pathname.match(extensionMatcher)) {
            return next();
        }
        delete require.cache[require.resolve('../dist/server.bundle')];
        var render = require('../dist/server.bundle').render;
        console.log('start render', new Date());
        return render(Object.assign({ url: ctx.request.URL }, renderOptions), initializationOptions)
            .then(function (html) {
            var children = module.children;
            for (var i = children.length - 1; i >= 0; i--) {
                if (children[i].filename.indexOf('server.bundle') > -1) {
                    module.children.splice(i, 1);
                }
            }
            global.gc();
            ctx.body = html;
            console.log('body set', new Date());
        })["catch"](function (e) {
            ctx.body = "<html><body>Failed to render " + pathname + "</body></html>";
            console.log("Failed to render " + pathname);
            console.log(e);
        });
    };
};
