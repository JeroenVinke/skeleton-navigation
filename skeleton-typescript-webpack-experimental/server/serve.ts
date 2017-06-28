import * as Koa from 'koa';
import * as path from 'path';
import {aureliaKoaMiddleware} from './aurelia-koa-middleware';

const root = path.join(__dirname, '../');
const output = 'dist';
var port = process.env.PORT || 8080;


function serve() {
  return new Promise(resolve => {
    const app = new Koa();

    app.use(async (ctx, next) => {
      console.log('Request URL: ' + ctx.request.URL.toString());
      await next();        
    });

    // when you run webpack through code, you could grab the bundles and css from the output:
    // https://github.com/JeroenVinke/skeleton-navigation/blob/ssr-improvements/skeleton-typescript-webpack-experimental/server/build.ts#L21-L22

    app.use(aureliaKoaMiddleware({
      preboot: true,
      stylesheets: ['dist/0.css'],
      bundles: ['dist/app.bundle.js', 'dist/vendor.bundle.js'],
      templateContext: {
        title: 'Aurelia Server Side Rendering',
        baseUrl: '/'
      },
      template: require('fs').readFileSync('./index.ssr.ejs', 'utf-8')
    }));

    app.use(require('koa-static')(root));
    app.use(require('koa-static')(output));

    console.log('Starting server....');
    app.listen(port);
    console.log(`Listening server-side-rendered at http://localhost:${port}/`)

    resolve();
  });
}

export { serve };