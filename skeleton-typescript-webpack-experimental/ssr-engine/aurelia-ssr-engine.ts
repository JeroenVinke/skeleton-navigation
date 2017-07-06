import * as jsdom from 'jsdom';
import * as path from 'path';
import {RenderOptions, AppInitializationOptions} from './interfaces';
import {transform} from './transformers';

declare var __webpack_require__;
declare var __nodejs_require__;

function render(options: RenderOptions, initOptions: AppInitializationOptions) {
  return start(initOptions, options.url.toString())
  .then((app: { aurelia, main, host, DOM }) => {
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

    let appHTML = app.host.outerHTML;

    let html = options.template;

    html = transform(html, { app: appHTML, document: app.DOM.global.document }, options);

    app.aurelia = null;
    app.main = null;
    app.DOM = null;
    app = null;

    return html;
  });
}

function start(options: AppInitializationOptions, requestUrl: string) {
  // clear the nodejs require and webpack cache
  // otherwise the app does not use new instances of things like aurelia-logging
  // and aurelia-pal (in other words, the jsdom won't be unique otherwise)
  while(Object.keys(__webpack_require__.c).length > 0) {
    delete __webpack_require__.c[Object.keys(__webpack_require__.c)[0]];
  }
  delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal')];
  delete __nodejs_require__.cache[__nodejs_require__.resolve('aurelia-pal-nodejs')];

  const {Aurelia, PLATFORM, DOM} = require('aurelia-framework');
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

  var host = DOM.global.document.createElement('app');
  DOM.global.document.body.appendChild(host);

  // without this location.pathname is set to /blank by jsdom
  // this needs to be a valid url format, any url is fine
  jsdom.changeURL(DOM.global.window, requestUrl);

  var aurelia = new Aurelia(new WebpackLoader());
  aurelia.host = host;

  const attribute = DOM.global.document.createAttribute('aurelia-app')
  attribute.value = options.serverMainId;
  aurelia.host.attributes.setNamedItem(attribute);

  // todo: supply through main
  var main = options.main();

  if (!main.configure) { 
    throw new Error(`Server main has no configure function`); 
  } 

  return main.configure(aurelia)
  .then(() => new Promise(resolve => {
    // we need to wait for aurelia-composed
    // because otherwise some things aren't ready yet
    // e.g. the router's navigation property has href's which are undefined
    DOM.global.window.addEventListener('aurelia-composed', () => {
      resolve({
        aurelia: aurelia,
        main: main,
        host: host,
        DOM: DOM
      });
    });
  }));
}

export {
  render
};