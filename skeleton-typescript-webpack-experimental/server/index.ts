/// <reference types="jquery" />

import * as path from 'path';
import 'aurelia-polyfills';
import {Options, NodeJsLoader} from 'aurelia-loader-nodejs';
import {PLATFORM, DOM} from 'aurelia-pal';
import {globalize} from 'aurelia-pal-nodejs';
import * as jsdom from 'jsdom';
import {Aurelia} from 'aurelia-framework';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as webpackConfig from '../webpack.config';
import * as webpack from 'webpack';
import * as ejs from 'ejs';

var server = null;
const port = 8765;

// ----------- setup ----------------
// ignore importing '.css' files, useful only for Webpack codebases that do stuff like require('./file.css'):
require.extensions['.css'] = function (m, filename) {
  return
}

// set the root directory where the aurelia loader will resolve to
// this is the 'src' dir in case of skeleton
Options.relativeToDir = path.resolve(__dirname, '..', 'src')

process.on('unhandledRejection', function(reason, p) {
  console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason)
})

// initialize PAL and set globals (window, document, etc.)
globalize()

// needed by bootstrap:
;(global as any).$ = (global as any).jQuery = require('jquery')
;(global as any).server = true

// aurelia expects console.debug
console.debug = console.log
// --------------------- end setup -----------------



// ---------------- webpack compilation -------------------
const config = webpackConfig({
  production: false, server: false, extractCss: false, coverage: false
});
const compiler = webpack(config);
function onBuild(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) console.error(err.details);
    process.exit(1);
  } else {
    process.stdout.write(stats.toString({ colors: require('supports-color') }) + '\n');
  }
}
console.log('Creating webpack bundles....');
compiler.watch({}, onBuild);
compiler.plugin('done', () => {
  setTimeout(() => {
    console.log('Webpack bundles created');
    
    if (!server) {
      serve();
    }

    delete require.cache[require.resolve('../src/main')]

    console.log(`Listening server-side-rendered at http://localhost:${port}/`)
  }, 100);
});
// ------------- end webpack compilation ---------------

// ------------ express ----------------
function serve() {
  const app = new Koa();
  const router = new Router();

  const root = path.join(__dirname, '../');
  const dist = path.join(root, 'dist');
  const staticDir = path.join(root, 'static');

  app.use(async (ctx, next) => {
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (!ctx.request.path.match(extensionMatcher)) {
      let html = await createApp(ctx.request.URL.toString());
      ctx.body = html;
    } else {
      await next();
    }
  });

  app.use(require('koa-static')(root));
  app.use(require('koa-static')(dist));

  app
    .use(router.routes())
    .use(router.allowedMethods());

  console.log('Starting server....');
  server = app.listen(port);
}
// ------------- end express --------------------

function createApp(url) {
  // https://github.com/tmpvar/jsdom/tree/a6acac4e9dec4f859fff22676fb4e9eaa9139787#changing-the-url-of-an-existing-jsdom-window-instance
  jsdom.changeURL(global.window, url);
  
  const aurelia = new Aurelia(new NodeJsLoader())
  aurelia.host = document.body
  ;(aurelia as any).configModuleId = 'main' // parse html template and find the aurelia-app="" ?

  // note: this assumes your configure method awaits or returns the value of aurelia.setRoot(...)
  // skeletons currently don't do that so you need to adjust
  return require('../src/main').configure(aurelia).then(x => {
    const attribute = document.createAttribute('aurelia-app')
    attribute.value = 'main'
    document.body.attributes.setNamedItem(attribute)

    var vendorScript = document.createElement('script');
    vendorScript.type = 'text/javascript';
    vendorScript.src = 'dist/vendor.bundle.js';
    document.body.appendChild(vendorScript);

    var appScript = document.createElement('script');
    appScript.type = 'text/javascript';
    appScript.src = 'dist/app.bundle.js';
    document.body.appendChild(appScript);

    var template = ejs.compile(require('fs').readFileSync('./index.ejs', 'utf-8'));

    return template({ 
      htmlWebpackPlugin : {
        options: {
          metadata: {
            baseUrl: '',
            title: 'Aurelia Skeleton Navigation',
            ssr: document.body.outerHTML
          }
        }
      }
    });
  }).catch(e => console.log(e));
}