"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("aurelia-polyfills");
var aurelia_framework_1 = require("aurelia-framework");
var aurelia_router_1 = require("aurelia-router");
var aurelia_loader_nodejs_1 = require("aurelia-loader-nodejs");
var aurelia_pal_nodejs_1 = require("aurelia-pal-nodejs");
var jsdom = require("jsdom");
var preboot = require("preboot");
var path = require("path");
var ejs = require("ejs");
var __aurelia__ = null;
var __host__ = null;
function initializeSSR(options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!options) {
                        options = {};
                    }
                    if (!options.srcRoot) {
                        options.srcRoot = path.resolve(__dirname, '..', '..', 'src');
                    }
                    if (!options.serverMainId) {
                        options.serverMainId = 'main';
                    }
                    if (!options.serverMain) {
                        options.serverMain = path.join(options.srcRoot, options.serverMainId);
                    }
                    // ignore importing '.css' files, useful only for Webpack codebases that do stuff like require('./file.css'):
                    require.extensions['.css'] = function (m, filename) {
                        return;
                    };
                    // set the root directory where the aurelia loader will resolve to
                    // this is the 'src' dir in case of skeleton
                    aurelia_loader_nodejs_1.Options.relativeToDir = options.srcRoot;
                    // initialize PAL and set globals (window, document, etc.)
                    aurelia_pal_nodejs_1.globalize();
                    // aurelia expects console.debug
                    // this also allows you to see aurelia logging in cmd/terminal
                    console.debug = console.log;
                    return [4 /*yield*/, initializeApp(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.initializeSSR = initializeSSR;
function render(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var router, inputTags, i, input, app, title, headStyleTags, html, prebootOptions, inlinePrebootCode, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!options.route) {
                                    options.route = '/';
                                }
                                if (!options.templateContext) {
                                    options.templateContext = {};
                                }
                                if (!options.template) {
                                    throw new Error('template is necessary when calling render()');
                                }
                                if (options.replayDelay === undefined) {
                                    options.replayDelay = 10;
                                }
                                if (!!__aurelia__) return [3 /*break*/, 2];
                                console.log('Aurelia hasn\'t been initialized yet server-side, initializing now...');
                                return [4 /*yield*/, initializeSSR(options)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                router = __aurelia__.container.get(aurelia_router_1.Router);
                                console.log("Routing to " + options.route);
                                return [4 /*yield*/, router.navigate(options.route)];
                            case 3:
                                _a.sent();
                                inputTags = Array.prototype.slice.call(document.body.querySelectorAll('input'));
                                for (i = 0; i < inputTags.length; i++) {
                                    input = inputTags[i];
                                    if (input.value != null)
                                        input.defaultValue = input.value;
                                }
                                app = __host__.outerHTML;
                                title = document.head.querySelector('title');
                                headStyleTags = Array.prototype.slice.call(document.head.querySelectorAll('style'));
                                try {
                                    html = ejs.compile(options.template)({
                                        htmlWebpackPlugin: {
                                            options: {
                                                metadata: Object.assign(options.templateContext, {
                                                    ssr: true,
                                                    app: app,
                                                    title: title.innerHTML
                                                })
                                            }
                                        }
                                    });
                                }
                                catch (e) {
                                    console.log("Failed to compile template");
                                    console.log(e);
                                    throw e;
                                }
                                if (options.preboot) {
                                    prebootOptions = Object.assign({
                                        appRoot: options.appRoots || ['body']
                                    }, options.prebootOptions);
                                    inlinePrebootCode = preboot.getInlineCode(prebootOptions);
                                    html = appendToHead(html, "\r\n<script>" + inlinePrebootCode + "</script>\r\n");
                                    // preboot_browser can replay events that were stored by the preboot code
                                    html = appendToBody(html, "\r\n<script src=\"preboot_browser.js\"></script>\n  <script>\n  document.addEventListener('aurelia-started', function () {\n    // Aurelia has started client-side\n    // but the view/view-model hasn't been loaded yet so we need a small\n    // delay until we can playback all events.\n    setTimeout(function () { preboot.complete(); }, " + options.replayDelay + ");\n  });\n  </script>");
                                }
                                // copy over any style tags
                                for (i = 0; i < headStyleTags.length; i++) {
                                    html = appendToHead(html, headStyleTags[i].outerHTML);
                                }
                                resolve(html);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.render = render;
function appendToBody(htmlString, toAppend) {
    return htmlString.replace('</body>', toAppend + "</body>");
}
function appendToHead(htmlString, toAppend) {
    return htmlString.replace('</head>', toAppend + "</head>");
}
function initializeApp(options) {
    return __awaiter(this, void 0, void 0, function () {
        var main, e_1, attribute;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // without this location.pathname is set to /blank
                    // this needs to be a valid url format, any url is fine as it's going to
                    // be changed through the Router of Aurelia
                    jsdom.changeURL(global.window, 'http://localhost:8765');
                    __host__ = document.createElement('app');
                    document.body.appendChild(__host__);
                    __aurelia__ = new aurelia_framework_1.Aurelia(new aurelia_loader_nodejs_1.NodeJsLoader());
                    __aurelia__.host = __host__;
                    main = null;
                    try {
                        main = require(options.serverMain);
                        if (!main.configure) {
                            throw new Error("Server main has no configure function");
                        }
                    }
                    catch (e) {
                        console.log('Unable to require() the server main file');
                        console.log(e);
                        throw e;
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, main.configure(__aurelia__)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log('Error while running the configure() method of the server main file');
                    throw e_1;
                case 4:
                    attribute = document.createAttribute('aurelia-app');
                    attribute.value = options.serverMainId;
                    __aurelia__.host.attributes.setNamedItem(attribute);
                    return [2 /*return*/];
            }
        });
    });
}
