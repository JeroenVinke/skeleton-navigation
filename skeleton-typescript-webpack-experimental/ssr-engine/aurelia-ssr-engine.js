"use strict";
exports.__esModule = true;
var transformers_1 = require("./transformers");
function render(options, initOptions) {
    return start(initOptions, options.url.toString())
        .then(function (app) {
        if (!options.url) {
            throw new Error('url is required when calling render()');
        }
        if (!options.template) {
            throw new Error('template is required when calling render()');
        }
        // <input> .value property does not map to @value attribute, .defaultValue does.
        // so we need to copy that value over if we want it to serialize into HTML <input value="">
        // without this there isn't a value attribute on any of the input tags
        var inputTags = Array.prototype.slice.call(app.DOM.global.document.body.querySelectorAll('input'));
        for (var i = 0; i < inputTags.length; i++) {
            var input = inputTags[i];
            if (input.value != null)
                input.defaultValue = input.value;
        }
        var appHTML = app.host.outerHTML;
        var html = options.template;
        html = transformers_1.transform(html, { app: appHTML, document: app.DOM.global.document }, options);
        app.DOM.global.window.close();
        delete app.aurelia;
        delete app.main;
        delete app.DOM;
        app = null;
        global.gc();
        return html;
    });
}
exports.render = render;
function start(options, requestUrl) {
    // clear webpack cache
    // otherwise the app does not use new instances of things like aurelia-logging
    // while(Object.keys(__webpack_require__.c).length > 0) {
    //   delete __webpack_require__.c[Object.keys(__webpack_require__.c)[0]];
    // }
    // also delete things from the node.js cache, which are declared as external in the
    // webpack config. unfortunately webpack rewrites "require" to "__webpack_require"
    // which is not what we want. Workaround is using the DefinePlugin
    // which rewrites "__nodejs_require__" to "require"
    // delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal')];
    // delete __nodejs_require__.cache[__nodejs_require__.resolve('../pal-nodejs')];
    delete require.cache[require.resolve('aurelia-pal')];
    delete require.cache[require.resolve('../pal-nodejs')];
    var _a = require('aurelia-pal'), DOM = _a.DOM, PLATFORM = _a.PLATFORM, FEATURE = _a.FEATURE;
    var globalize = require('../pal-nodejs').globalize;
    // even though we store an instance of jsdom in aurelia-pal, of which a new instance is created per request
    // we need globalize instead of initialize because some apps use the self global, and so that you can use Element
    // e.g. through DI
    globalize();
    // aurelia expects console.debug
    // this also allows you to see aurelia logging in cmd/terminal
    console.debug = console.log;
    if (!options.serverMainId) {
        options.serverMainId = 'main';
    }
    var Aurelia = require('aurelia-framework').Aurelia;
    var WebpackLoader = require('aurelia-loader-webpack').WebpackLoader;
    var jsdom = require('jsdom');
    var host = DOM.global.document.createElement('app');
    DOM.global.document.body.appendChild(host);
    // url of jsdom should be equal to the request urll
    // this dictates what page aurelia loads on startup
    PLATFORM.jsdom.reconfigure({ url: requestUrl });
    var aurelia = new Aurelia(new WebpackLoader());
    aurelia.host = host;
    var attribute = DOM.global.document.createAttribute('aurelia-app');
    attribute.value = options.serverMainId;
    aurelia.host.attributes.setNamedItem(attribute);
    var main = options.main();
    console.log(main);
    if (!main.configure) {
        throw new Error("Server main has no configure function");
    }
    return main.configure(aurelia)
        .then(function () { return new Promise(function (resolve) {
        // we need to wait for aurelia-composed
        // because otherwise some things aren't ready yet
        // e.g. the router's navigation property has href's which are undefined
        DOM.global.window.addEventListener('aurelia-composed', function () {
            resolve({
                aurelia: aurelia,
                main: main,
                host: host,
                DOM: DOM
            });
        });
    }); });
}
