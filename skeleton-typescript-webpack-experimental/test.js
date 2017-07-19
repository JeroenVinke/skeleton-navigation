require('./reflect');
const Koa = require('koa');
const path = require('path');
const {aureliaKoaMiddleware} = require('./koa-middleware/aurelia-koa-middleware');

// aurelia expects console.debug
// this also allows you to see aurelia logging in cmd/terminal
console.debug = console.log;

global.array_pop = Array.prototype.pop;
global.array_push = Array.prototype.push;
global.array_reverse = Array.prototype.reverse;
global.array_shift = Array.prototype.shift;
global.array_sort = Array.prototype.sort;
global.array_splice = Array.prototype.splice;
global.array_unshift = Array.prototype.unshift;

var port = process.env.PORT || 8080;

const app = new Koa();

app.use(aureliaKoaMiddleware({
  preboot: true,
  minifyHtml: false,
  template: require('fs').readFileSync(path.resolve('./dist/index.ssr.html'), 'utf-8')
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