"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("aurelia-polyfills");
var aurelia_loader_nodejs_1 = require("aurelia-loader-nodejs");
var aurelia_pal_nodejs_1 = require("aurelia-pal-nodejs");
var path = require("path");
aurelia_loader_nodejs_1.Options.relativeToDir = path.join(__dirname, 'unit');
aurelia_pal_nodejs_1.globalize();
