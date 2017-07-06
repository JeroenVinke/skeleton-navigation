import * as jsdom from 'jsdom';
import * as path from 'path';
import {RenderOptions, AppInitializationOptions} from './interfaces';
import {transform} from './transformers';

var __host__ = null;
declare var __webpack_require__;
declare var __nodejs_require__;

function render(options: RenderOptions, initOptions: AppInitializationOptions) {
  return new Promise((resolve, reject) => {
    start(initOptions, options.url.toString())
    .then((app: { aurelia, main }) => {
      if (!options.url) {
        throw new Error('url is required when calling render()');
      }
      if (!options.template) {
        throw new Error('template is required when calling render()');
      }

      // <input> .value property does not map to @value attribute, .defaultValue does.
      // so we need to copy that value over if we want it to serialize into HTML <input value="">
      // without this there isn't a value attribute on any of the input tags
      let inputTags = Array.prototype.slice.call(document.body.querySelectorAll('input'));
      for(let i = 0; i < inputTags.length; i++) {
        let input = inputTags[i];
        if (input.value != null) 
          input.defaultValue = input.value;
      }

      let appHTML = __host__.outerHTML;

      app.aurelia = null;
      app.main = null;
      app = null;

      let html = options.template;

      html = transform(html, { app: appHTML }, options);

      resolve(html);
    });
  });
}

function start(options: AppInitializationOptions, requestUrl: string) {
  return new Promise(resolve => {
    // clear the nodejs require and webpack cache
    // otherwise the app does not use new instances of things like aurelia-logging
    // and aurelia-pal (in other words, the jsdom won't be unique otherwise)
    while(Object.keys(__webpack_require__.c).length > 0) {
      delete __webpack_require__.c[Object.keys(__webpack_require__.c)[0]];
    }
    delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal')];
    delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal-nodejs')];

    const {Aurelia, PLATFORM} = require('aurelia-framework');
    const {AppRouter} = require('aurelia-router');
    const {WebpackLoader} = require('aurelia-loader-webpack');
    const {globalize} = require('aurelia-pal-nodejs');

    //initialize PAL and set globals (window, document, etc.)
    globalize();

    // aurelia expects console.debug
    // this also allows you to see aurelia logging in cmd/terminal
    console.debug = console.log;

    if (!options.serverMainId) {
      options.serverMainId = 'main';
    }

    if (!__host__) {
      __host__ = document.createElement('app');
      document.body.appendChild(__host__);
    }

    // without this location.pathname is set to /blank by jsdom
    // this needs to be a valid url format, any url is fine
    jsdom.changeURL(global.window, requestUrl);

    var aurelia = new Aurelia(new WebpackLoader());
    aurelia.host = __host__;

    const attribute = document.createAttribute('aurelia-app')
    attribute.value = options.serverMainId;
    aurelia.host.attributes.setNamedItem(attribute);
  
    // todo: supply through main
    var main = require('../src/main');

    if (!main.configure) { 
      throw new Error(`Server main has no configure function`); 
    } 

    return main.configure(aurelia)
    .then(() => {
      var router = aurelia.container.get(AppRouter);

      // we need to wait for aurelia-composed
      // because otherwise some things aren't ready yet
      // e.g. the router's navigation property has href's which are undefined
      global.window.addEventListener('aurelia-composed', () => {
        resolve({
          aurelia: aurelia,
          main: main
        });
      });
    }).catch(e => { 
      console.log('Error while running the configure() method of the server main file'); 
      throw e; 
    }); 
  });
}

export {
  start,
  render
};