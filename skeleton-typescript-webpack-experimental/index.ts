
const Aurelia = require('aurelia-framework').Aurelia;
const initializeSSR = require('./build/tasks/external/aurelia-ssr-renderer').initializeSSR;
const {Options, NodeJsLoader} = require('aurelia-loader-nodejs');
const {WebpackLoader} = require('aurelia-loader-webpack');
const pal = require('aurelia-pal');
const path = require('path');

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
  console.log(error.stack);
});

initializeSSR({
  srcRoot: path.resolve(__dirname, '..', 'src')
});


var __host__ = document.createElement('app');
document.body.appendChild(__host__);

var __aurelia__ = new Aurelia(new WebpackLoader());
__aurelia__.host = __host__;

let main = null;

try {
  main = require('./src/main');

  if (!main.configure) {
    throw new Error(`Server main has no configure function`);
  }
} catch (e) {
  console.log('Unable to require() the server main file');
  console.log(e);
  throw e;
}

  const attribute = document.createAttribute('aurelia-app')
  attribute.value = 'main';
  __aurelia__.host.attributes.setNamedItem(attribute);

main.configure(__aurelia__)
.then(() => {

  console.log(document.body.outerHTML);
}).catch(e => {
  console.log('Error while running the configure() method of the server main file');
  throw e;
});

















