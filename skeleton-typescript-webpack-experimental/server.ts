import * as Koa from 'koa';
import * as path from 'path';
import {setup} from './ssr-engine/aurelia-ssr-engine';
import {aureliaKoaMiddleware} from './koa-middleware/aurelia-koa-middleware';

// setup the environment for server side rendering
setup();

var port = process.env.PORT || 8080;

const app = new Koa();

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












