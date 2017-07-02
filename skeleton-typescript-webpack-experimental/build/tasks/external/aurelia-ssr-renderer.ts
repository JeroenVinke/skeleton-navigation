import {Aurelia} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {WebpackLoader} from 'aurelia-loader-webpack';
import {globalize} from 'aurelia-pal-nodejs';
import * as jsdom from 'jsdom';
import * as path from 'path';
import {RenderOptions, AppInitializationOptions} from './interfaces';
import {transform} from './transformers';

var __aurelia__ = null;
var __host__ = null;

function setup() {
  // initialize PAL and set globals (window, document, etc.)
  globalize();
  
  // aurelia expects console.debug
  // this also allows you to see aurelia logging in cmd/terminal
  console.debug = console.log;

  __host__ = document.createElement('app');
  document.body.appendChild(__host__);
}

async function render(options: RenderOptions) {
  return new Promise(async (resolve, reject) => {
    if (!__aurelia__) {
      return reject(new Error('Aurelia has not yet been started. Call start() on the engine before any render() call'));
    }

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

    let router = __aurelia__.container.get(Router);
    console.log(`Routing to ${options.route}`);

    await router.navigate(options.route);

    // <input> .value property does not map to @value attribute, .defaultValue does.
    // so we need to copy that value over if we want it to serialize into HTML <input value="">
    // without this there isn't a value attribute on any of the input tags
    let inputTags = Array.prototype.slice.call(document.body.querySelectorAll('input'));
    for(let i = 0; i < inputTags.length; i++) {
      let input = inputTags[i];
      if (input.value != null) 
        input.defaultValue = input.value;
    }

    let app = __host__.outerHTML;
    let html = options.template;

    html = transform(html, { app: app }, options);

    resolve(html);
  });
}


function start(options: AppInitializationOptions) {
  if (__aurelia__) {
    return Promise.resolve();
  }

  if (!options.serverMainId) {
    options.serverMainId = 'main';
  }

  // without this location.pathname is set to /blank by jsdom
  // this needs to be a valid url format, any url is fine
  jsdom.changeURL(global.window, 'http://localhost:8765');

  __host__ = document.createElement('app');
  document.body.appendChild(__host__);

  __aurelia__ = new Aurelia(new WebpackLoader());
  __aurelia__.host = __host__;

  const attribute = document.createAttribute('aurelia-app')
  attribute.value = options.serverMainId;
  __aurelia__.host.attributes.setNamedItem(attribute);

  var main = options.main;

  if (!main.configure) { 
    throw new Error(`Server main has no configure function`); 
  } 

  return main.configure(__aurelia__)
  .then(() => {
    console.log('Aurelia initialized server side');
  }).catch(e => { 
    console.log('Error while running the configure() method of the server main file'); 
    throw e; 
  }); 
}

export {
  setup,
  start,
  render
};