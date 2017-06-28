import 'aurelia-polyfills';
import {Aurelia} from 'aurelia-framework';
import {Router, AppRouter} from 'aurelia-router';
import {SSRRouter} from './aurelia-ssr-router';
import {Options, NodeJsLoader} from 'aurelia-loader-nodejs';
import {globalize} from 'aurelia-pal-nodejs';
import * as jsdom from 'jsdom';
import * as preboot from 'preboot';
import * as path from 'path';
import * as ejs from 'ejs';
import {RenderOptions, InitializationOptions} from './interfaces';

var aurelia = null;
var host = null;

async function initializeSSR(options: RenderOptions | InitializationOptions) {
  // ignore importing '.css' files, useful only for Webpack codebases that do stuff like require('./file.css'):
  require.extensions['.css'] = function (m, filename) {
    return
  };

  // set the root directory where the aurelia loader will resolve to
  // this is the 'src' dir in case of skeleton
  Options.relativeToDir = options.srcRoot || path.resolve(__dirname, '..', 'src');

  // initialize PAL and set globals (window, document, etc.)
  globalize();
  
  // aurelia expects console.debug
  // this also allows you to see aurelia logging in cmd/terminal
  console.debug = console.log;

  await initializeApp(options);
}

async function render(options: RenderOptions) {
  if (!options.route || !options.templateContext || !options.template) {
    throw new Error('Missing property (route | templateContext | template)');
  }

  if (!aurelia) {
    console.log('Aurelia hasn\'t been initialized yet server-side, initializing now...');
    await initializeSSR(options);
  }

  let router = aurelia.container.get(Router);
  console.log(`Routing to ${options.route}`);

  try {
    await router.navigate(options.route);
  } catch (e) {
    if (e.message.indexOf('Route not found') > -1) {
      throw new Error('404');
    } else {
      throw e;
    }
  }

  // <input> .value property does not map to @value attribute, .defaultValue does.
  // so we need to copy that value over if we want it to serialize into HTML <input value="">
  [].forEach.call(document.body.querySelectorAll('input'), input => {
    if (input.value != null) 
      input.defaultValue = input.value;
  });

  let app = document.body.outerHTML;
  let html;

  try {
    html = ejs.compile(options.template)({ 
      htmlWebpackPlugin : {
        options: {
          metadata: Object.assign(options.templateContext, {
            ssr: true,
            app: app
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
    var prebootOptions = {
      appRoot: options.appRoots || ['body']
    };
    var inlinePrebootCode = preboot.getInlineCode(prebootOptions);
    html = appendToHead(html, `\r\n<script>${inlinePrebootCode}</script>\r\n`);

    // preboot_browser can replay events that were stored by the preboot code
    html = appendToBody(html, `\r\n<script src="preboot_browser.js"></script>
<script>
document.addEventListener('aurelia-started', function () {
  // Aurelia has started client-side
  // but the view/view-model hasn't been loaded yet so we need a small
  // delay until we can playback all events.
  setTimeout(function () { preboot.complete(); }, ${options.replayDelay || 10});
});
</script>`);
  }

  return html;
}

function appendToBody(htmlString, toAppend) {
  return htmlString.replace('</body>', `${toAppend}</body>`);
}

function appendToHead(htmlString, toAppend) {
  return htmlString.replace('</head>', `${toAppend}</head>`);
}

async function initializeApp(options: RenderOptions | InitializationOptions) {
  // this needs to be a valid url format
  // without this location.pathname is set to /blank
  // https://github.com/tmpvar/jsdom/tree/a6acac4e9dec4f859fff22676fb4e9eaa9139787#changing-the-url-of-an-existing-jsdom-window-instance
  jsdom.changeURL(global.window, 'http://localhost:8765');

  host = document.createElement('app');
  document.body.appendChild(host);

  aurelia = new Aurelia(new NodeJsLoader());
  aurelia.host = host;

  // Customized AppRouter which throws an error on 404 (instead of just logging the 404)
  // so we can handle this event in the express/koa/etc
  aurelia.container.registerSingleton(Router, SSRRouter);
  
  // need to get "require('../src/main')" out of here
  // but it fails to import styles.css from main.ts when you do require('../src/main') this in server/index.ts
  // probably because 
  // require.extensions['.css'] = function (m, filename) {
  //    return
  // };
  // hasn't executed yet in initializeSSR()
  await require('../src/main').configure(aurelia);

  const attribute = document.createAttribute('aurelia-app')
  attribute.value = options.serverMainId || 'main';
  aurelia.host.attributes.setNamedItem(attribute);
}

export {
  initializeSSR,
  render
};