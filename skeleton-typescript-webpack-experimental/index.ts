import * as Koa from 'koa';
import * as path from 'path';
import {setup} from './build/tasks/external/aurelia-ssr-renderer';
import {aureliaKoaMiddleware} from './build/tasks/external/aurelia-koa-middleware';
import {WebpackLoader} from 'aurelia-loader-webpack';

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
  main: require('./src/main'),
  template: require('fs').readFileSync(path.resolve('./index.ssr.ejs'), 'utf-8')
}));

app.use(require('koa-static')(path.resolve(__dirname)));
app.use(require('koa-static')(path.resolve('dist')));

console.log('Starting server....');
app.listen(port);
console.log(`Listening at http://localhost:${port}/`);


// initializeSSR();

// let main = require('./src/main');

// main.configure(__aurelia__)
// .then(() => {

//   console.log(document.body.outerHTML);
// }).catch(e => {
//   console.log('Error while running the configure() method of the server main file');
//   throw e;
// });



process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
  console.log(error.stack);
});












