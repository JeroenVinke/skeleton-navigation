import * as Koa from 'koa';
import * as path from 'path';
import {render} from './aurelia-ssr';

const root = path.join(__dirname, '../');
const output = 'dist';
const port = 8765;

function serve(assets) {
  return new Promise(resolve => {
    const app = new Koa();

    app.use(async (ctx, next) => {
      console.log('Request URL: ' + ctx.request.URL.toString());
      await next();        
    });

    // perhaps we could create a koa-specific middleware
    app.use(async (ctx, next) => {
      let extensionMatcher = /^.*\.[^\\]+$/;
      if (!ctx.request.path.match(extensionMatcher)) {
        let html = await render({ 
          route: ctx.request.URL.pathname,
          preboot: true,
          stylesheets: assets.stylesheets,
          bundles: assets.bundles,
          templateContext: {
            title: 'Aurelia Server Side Rendering',
            baseUrl: '/'
          },
          template: require('fs').readFileSync('./index.ejs', 'utf-8')
        });
        ctx.body = html;
      } else {
        await next();
      }
    });

    app.use(require('koa-static')(root));
    app.use(require('koa-static')(output));

    console.log('Starting server....');
    app.listen(port);
    console.log(`Listening server-side-rendered at http://localhost:${port}/`)

    resolve();
  });
}

export { serve };