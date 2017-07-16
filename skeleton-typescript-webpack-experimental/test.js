const Koa = require('koa');
const path = require('path');
const {aureliaKoaMiddleware} = require('./koa-middleware/aurelia-koa-middleware');

var port = process.env.PORT || 8080;

const app = new Koa();

app.use(aureliaKoaMiddleware({
  preboot: true,
  minifyHtml: false,
  template: require('fs').readFileSync(path.resolve('./dist/index.ssr.html'), 'utf-8')
}, {
  main: () => {
    let children = process.mainModule.children;
    for(let i = children.length - 1; i >= 0; i--) {
      if (children[i].filename.indexOf('server.bundle') > -1) {
        process.mainModule.children.splice(i, 1);
      }
    }

    delete require.cache[require.resolve('./dist/server.bundle')];
    return require('./dist/server.bundle');
  }
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