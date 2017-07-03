import * as Koa from 'koa';
import * as koaCash from 'koa-cash';
import * as NodeCache from 'node-cache';
import * as path from 'path';
import {setup} from './ssr-engine/aurelia-ssr-engine';
import {aureliaKoaMiddleware} from './koa-middleware/aurelia-koa-middleware';

// setup the environment for server side rendering
setup();

var port = process.env.PORT || 8080;

const app = new Koa();
const nodeCache = new NodeCache();
const cachedPages = /^\/users/;

app.use(koaCash({
  get: (key) => {
    return nodeCache.get(key);
  },
  set: (key, value) => {
    nodeCache.set(key, value, 10000);
  }
}));

app.use(async (ctx, next) => {
  if (ctx.request.URL.pathname.match(cachedPages)) {
    if (await ctx.cashed()) 
      return;
  }

  await next();
});

app.use(aureliaKoaMiddleware({
  preboot: true,
  minifyHtml: false,
  template: require('fs').readFileSync(path.resolve('./dist/index.ssr.html'), 'utf-8')
}, {
  main: require('./src/main')
}));

app.use(require('koa-static')(path.resolve(__dirname)));
app.use(require('koa-static')(path.resolve(__dirname, 'dist')));

console.log('Starting server....');
app.listen(port);
console.log(`Listening at http://localhost:${port}/`);

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
  console.log(error.stack);
});












