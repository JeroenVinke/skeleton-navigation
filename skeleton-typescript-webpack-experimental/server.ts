import * as Koa from 'koa';
import * as path from 'path';
import {setup} from './build/tasks/external/aurelia-ssr-renderer';
import {aureliaKoaMiddleware} from './build/tasks/external/aurelia-koa-middleware';

// setup the environment for server side rendering
setup();

var port = process.env.PORT || 8080;

const app = new Koa();

app.use(async (ctx, next) => {
  console.log('Request URL: ' + ctx.request.URL.toString());
  await next();        
});

app.use(aureliaKoaMiddleware({
  preboot: true,
  templateContext: {
    title: 'Aurelia Server Side Rendering',
    baseUrl: '/'
  },
  minifyHtml: true,
  template: require('fs').readFileSync(path.resolve('./dist/index.ssr.html'), 'utf-8')
}, {
  main: require('./src/main')
}));

app.use(require('koa-static')(path.resolve(__dirname, '..')));
app.use(require('koa-static')(path.resolve(__dirname)));

console.log('Starting server....');
app.listen(port);
console.log(`Listening at http://localhost:${port}/`);

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
  console.log(error.stack);
});












