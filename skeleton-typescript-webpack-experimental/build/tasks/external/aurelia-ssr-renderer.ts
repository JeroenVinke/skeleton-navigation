import {Aurelia} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Options} from 'aurelia-loader-nodejs';
import {WebpackLoader} from 'aurelia-loader-webpack';
import {globalize} from 'aurelia-pal-nodejs';
import * as jsdom from 'jsdom';
import * as preboot from 'preboot';
import * as path from 'path';
import * as ejs from 'ejs';
import {RenderOptions, InitializationOptions, AppInitializationOptions} from './interfaces';

var __aurelia__ = null;
var __host__ = null;

function setup(options?: InitializationOptions) {
  if (!options) {
    options = {};
  }
  if (!options.srcRoot) {
    options.srcRoot = path.resolve(__dirname, 'src');
  }

  // set the root directory where the aurelia loader will resolve to
  // this is the 'src' dir in case of skeleton
  Options.relativeToDir = options.srcRoot;

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
    let title = document.head.querySelector('title');
    let headStyleTags = Array.prototype.slice.call(document.head.querySelectorAll('style'));
    let html;

    try {
      html = ejs.compile(options.template)({ 
        htmlWebpackPlugin : {
          options: {
            metadata: Object.assign(options.templateContext, {
              ssr: true,
              app: app,
              title: title.innerHTML
            })
          }
        }
      });
    } catch (e) {
      console.log(`Failed to compile template`);
      console.log(e);
      throw e;
    }

    if (options.preboot) {
      // preboot catches all events that happens before Aurelia gets loaded client-side
      // so that they can be replayed afterwards
      var prebootOptions = Object.assign({
        appRoot: options.appRoots || ['body']
      }, options.prebootOptions);
      var inlinePrebootCode = preboot.getInlineCode(prebootOptions);
      html = appendToHead(html, `\r\n<script>${inlinePrebootCode}</script>\r\n`);

      // preboot_browser can replay events that were stored by the preboot code
      html = appendToBody(html, `\r\n<script src="preboot_browser.js"></script>
  <script>
  document.addEventListener('aurelia-started', function () {
    // Aurelia has started client-side
    // but the view/view-model hasn't been loaded yet so we need a small
    // delay until we can playback all events.
    setTimeout(function () { preboot.complete(); }, ${options.replayDelay});
  });
  </script>`);
    }

    // copy over any style tags
    for(let i = 0; i < headStyleTags.length; i++) {
      html = appendToHead(html, headStyleTags[i].outerHTML);
    }
    
    resolve(html);
  });
}

function appendToBody(htmlString, toAppend) {
  return htmlString.replace('</body>', `${toAppend}</body>`);
}

function appendToHead(htmlString, toAppend) {
  return htmlString.replace('</head>', `${toAppend}</head>`);
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