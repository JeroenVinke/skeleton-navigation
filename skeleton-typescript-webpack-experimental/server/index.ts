/// <reference types="jquery" />

import * as path from 'path';
import 'aurelia-polyfills';
import {Options, NodeJsLoader} from 'aurelia-loader-nodejs';
import {PLATFORM, DOM} from 'aurelia-pal';
import {globalize} from 'aurelia-pal-nodejs';
import * as jsdom from 'jsdom';
import {Aurelia} from 'aurelia-framework';
import {Router as AureliaRouter} from 'aurelia-router';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as webpackConfig from '../webpack.config';
import * as webpack from 'webpack';
import * as ejs from 'ejs';
import * as preboot from 'preboot';

const port = 8765;
const htmlTemplate = ejs.compile(require('fs').readFileSync('./index.ejs', 'utf-8'));
var aurelia = null;
const root = path.join(__dirname, '../');
const output = 'dist';
var bundles = [];

async function start(done) {
  await setupEnv();
  await startWebpack();
  await initializeApp();
  await serve();
  done();
}

start(() => {
process.stdin.resume();
});


function setupEnv() {
  // ignore importing '.css' files, useful only for Webpack codebases that do stuff like require('./file.css'):
  require.extensions['.css'] = function (m, filename) {
    return
  };

  // set the root directory where the aurelia loader will resolve to
  // this is the 'src' dir in case of skeleton
  Options.relativeToDir = path.resolve(__dirname, '..', 'src');

  process.on('unhandledRejection', function(reason, p) {
    console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason);
  });

  // initialize PAL and set globals (window, document, etc.)
  globalize()

  // needed by bootstrap:
  ;(global as any).$ = (global as any).jQuery = require('jquery');
  ;(global as any).server = true;

  // aurelia expects console.debug
  console.debug = console.log;

  return Promise.resolve();
}


function startWebpack() {
  return new Promise((resolve, reject) => {
    const config = webpackConfig({
      production: false, server: false, extractCss: false, coverage: false
    });
    const compiler = webpack(config);
    function onBuild(err, stats) {
      bundles = Object.keys(stats.compilation.assets).filter(name => name.endsWith('bundle.js')).map(name => `${output}/${name}`);
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        process.exit(1);
      } else {
        process.stdout.write(stats.toString({ colors: require('supports-color') }) + '\n');
        resolve();
      }
    }
    console.log('Creating webpack bundles....');
    compiler.watch({}, onBuild);
    compiler.plugin('done', () => {
      console.log('Webpack bundles created');
      
      resolve();
    });
  });
}

function serve() {
  return new Promise(resolve => {
    const app = new Koa();
    const router = new Router();

    app.use(async (ctx, next) => {
      console.log('Request URL: ' + ctx.request.URL.toString());
      await next();        
    });

    app.use(async (ctx, next) => {
      
      let extensionMatcher = /^.*\.[^\\]+$/;
      if (!ctx.request.path.match(extensionMatcher)) {
        let html = await render({ 
          route: ctx.request.URL.pathname,
          preboot: true,
          templateContext: {
            title: 'Aurelia Server Side Rendering',
            baseUrl: '/'
          }
        });
        ctx.body = html;
      } else {
        await next();
      }
    });

    app.use(require('koa-static')(root));
    app.use(require('koa-static')(output));

    app
      .use(router.routes())
      .use(router.allowedMethods());

    console.log('Starting server....');
    app.listen(port);
    console.log(`Listening server-side-rendered at http://localhost:${port}/`)

    resolve();
  });
}

async function render(options) {
  let router = aurelia.container.get(AureliaRouter);
  console.log(`Routing to ${options.route}`);
  await router.navigate(options.route);

  let body = document.body.outerHTML;

  let html = htmlTemplate({ 
    htmlWebpackPlugin : {
      options: {
        metadata: Object.assign(options.templateContext, {
          body: body
        })
      }
    }
  });

  if (options.preboot) {
    // preboot catches all events that happens before Aurelia gets loaded client-side
    // so that they can be replayed afterwards
    var prebootOptions = {
      appRoot: ['body']
    };
    var inlinePrebootCode = preboot.getInlineCode(prebootOptions);
    html = appendBeforeHead(html, `\r\n<script>${inlinePrebootCode}</script>\r\n`);

    // preboot_browser can replay events that were stored by the preboot code
    html = appendBeforeBody(html, `\r\n<script src="preboot_browser.js"></script>
    <script>
      document.addEventListener('aurelia-started', function () {
        // Aurelia has started client-side
        // so now we can replay all events that have happened before Aurelia was loaded client-side.
        preboot.complete();
      });
    </script>`);
  }
  

  for (let bundle of bundles) {
    html = appendBeforeBody(html, `\r\n<script src="${bundle}" type="text/javascript"></script>`);
  }

  return html;
}

function appendBeforeBody(htmlString, toAppend) {
  return htmlString.replace('</body>', `${toAppend}</body>`);
}

function appendBeforeHead(htmlString, toAppend) {
  return htmlString.replace('</head>', `${toAppend}</head>`);
}

async function initializeApp() {
  // this needs to be a valid url
  // without this location.pathname is set to /blank
  // https://github.com/tmpvar/jsdom/tree/a6acac4e9dec4f859fff22676fb4e9eaa9139787#changing-the-url-of-an-existing-jsdom-window-instance
  jsdom.changeURL(global.window, 'http://localhost:8765');

  aurelia = new Aurelia(new NodeJsLoader())
  aurelia.host = document.body
  ;(aurelia as any).configModuleId = 'main'; // we should probably put this in a config file
  
  await require('../src/main').configure(aurelia);

  const attribute = document.createAttribute('aurelia-app')
  attribute.value = 'main'
  document.body.attributes.setNamedItem(attribute);
}