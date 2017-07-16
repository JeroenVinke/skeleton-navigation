import * as path from 'path';
import {RenderOptions, AppInitializationOptions} from './interfaces';
import {transform} from './transformers';
const {globalize} = require('../pal-nodejs');

declare var __webpack_require__;
declare var __nodejs_require__;

function render(options: RenderOptions, initOptions: AppInitializationOptions) {
  return start(initOptions, options.url.toString())
  .then((app: { aurelia, main, host, DOM, PLATFORM }) => {
    if (!options.url) {
      throw new Error('url is required when calling render()');
    }
    if (!options.template) {
      throw new Error('template is required when calling render()');
    }

    // <input> .value property does not map to @value attribute, .defaultValue does.
    // so we need to copy that value over if we want it to serialize into HTML <input value="">
    // without this there isn't a value attribute on any of the input tags
    let inputTags = Array.prototype.slice.call(app.DOM.global.document.body.querySelectorAll('input'));
    for(let i = 0; i < inputTags.length; i++) {
      let input = inputTags[i];
      if (input.value != null) 
        input.defaultValue = input.value;
    }

    let appHTML = app.host.outerHTML;

    let html = options.template;

    html = transform(html, { app: appHTML, document: app.DOM.global.document }, options);

    app.DOM.global.window.close();
    delete app.aurelia;
    delete app.main;
    delete app.DOM;
    delete app.PLATFORM.jsdom;
    delete global.window;
    delete global.document;
    delete global.Element;
    delete global.SVGElement;
    delete global.HTMLElement;
    delete global.requestAnimationFrame;
    delete global.location;
    delete global.history;
    delete global.System;
    delete global.PAL;
    while(Object.keys(__webpack_require__.c).length > 0) {
      delete __webpack_require__.c[Object.keys(__webpack_require__.c)[0]];
    }

    app = null;

    return html;
  });
}

function start(options: AppInitializationOptions, requestUrl: string) {
  return new Promise(resolve => {
    // setTimeout(() => {
      const {DOM, PLATFORM, FEATURE} = require('aurelia-pal');

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

      const {Aurelia} = require('aurelia-framework');
      const {WebpackLoader} = require('aurelia-loader-webpack');

      var host = DOM.global.document.createElement('app');
      DOM.global.document.body.appendChild(host);

      // url of jsdom should be equal to the request urll
      // this dictates what page aurelia loads on startup
      PLATFORM.jsdom.reconfigure({ url: requestUrl });

      var aurelia = new Aurelia(new WebpackLoader());
      aurelia.host = host;

      const attribute = DOM.global.document.createAttribute('aurelia-app')
      attribute.value = options.serverMainId;
      aurelia.host.attributes.setNamedItem(attribute);

      var main = options.main();

      console.log(main);

      if (!main.configure) { 
        throw new Error(`Server main has no configure function`); 
      } 

      return main.configure(aurelia)
      .then(() => new Promise(r => {
        // we need to wait for aurelia-composed
        // because otherwise some things aren't ready yet
        // e.g. the router's navigation property has href's which are undefined
        DOM.global.window.addEventListener('aurelia-composed', () => {
          r({
            aurelia: aurelia,
            main: main,
            host: host,
            DOM: DOM,
            PLATFORM: PLATFORM
          });
        });
      }))
      .then(resolve);
    // }, 0);
  });
}

export {
  render
};