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

    require('aurelia-pal').reset();

    Array.prototype.pop = (<any>global).array_pop;
    Array.prototype.push = (<any>global).array_push;
    Array.prototype.reverse = (<any>global).array_reverse;
    Array.prototype.shift = (<any>global).array_shift;
    Array.prototype.sort = (<any>global).array_sort;
    Array.prototype.splice = (<any>global).array_splice;
    Array.prototype.unshift = (<any>global).array_unshift;

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
    delete global.self;

    let rdelete = (m) => {
      if (m.parent && m.parent.filename.indexOf('server.bundle') > -1) {
        delete m.parent;
      }

      for(let i = m.children.length - 1; i >= 0; i--) {
        if (m.children[i].filename.indexOf('server.bundle') > -1) {
          m.children.splice(i, 1);
        } else {
          rdelete(m.children[i]);
        }
      }
    };

    let rdeletec = (m) => {
      if (m.parent && m.parent.filename.indexOf('server.bundle') > -1) {
        console.log('delete parent from ', m.filename);
        delete m.parent;
      }

      for(let i = m.children.length - 1; i >= 0; i--) {
        if (m.children[i].filename.indexOf('server.bundle') > -1) {
        console.log('delete child from ', m.filename);
          m.children.splice(i, 1);
        } else {
          rdeletec(m.children[i]);
        }
      }
    };
    
    rdelete(process.mainModule);

    let keys = Object.keys(__nodejs_require__.cache);
    for(let i = 0; i < keys.length; i++) {
      rdeletec(__nodejs_require__.cache[keys[i]]);
    }

    for(let i = keys.length - 1; i >= 0; i--) {
      if (keys[i].indexOf('server.bundle.js') > -1 || keys[i].indexOf('aurelia-pal.js') > -1) {
        delete __nodejs_require__.cache[keys[i]];
      }
    }

    while(Object.keys(__webpack_require__.c).length > 0) {
      delete __webpack_require__.c[Object.keys(__webpack_require__.c)[0]];
    }
    while(Object.keys(__webpack_require__.m).length > 0) {
      delete __webpack_require__.m[Object.keys(__webpack_require__.m)[0]];
    }

    app = null;

    return html;
  });
}

function start(options: AppInitializationOptions, requestUrl: string) {
  return new Promise(resolve => {
    // setTimeout(() => {

      delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal')];
      delete __nodejs_require__.cache[__nodejs_require__.resolve('../pal-nodejs')];


      const {DOM, PLATFORM, FEATURE} = require('aurelia-pal');

      // even though we store an instance of jsdom in aurelia-pal, of which a new instance is created per request
      // we need globalize instead of initialize because some apps use the self global, and so that you can use Element
      // e.g. through DI
      globalize();

      if (!options) {
        options = { main: null };
      }

      if (!options.serverMainId) {
        options.serverMainId = 'server-main';
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

      var main = require('../src/main');


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