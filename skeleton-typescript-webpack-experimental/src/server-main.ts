import {Aurelia, Container} from 'aurelia-framework';
import {WebpackLoader} from 'aurelia-loader-webpack';
import {configure} from './main';
const {DirtyChecker} = require('aurelia-binding');
const palNodeJS = require('aurelia-pal-nodejs');
const pal = require('aurelia-pal');

function initialize() {
  const {initialize} = palNodeJS;
  const {PLATFORM} = pal;

  initialize();

  // expose anything the srr-engine needs
  return {
    PLATFORM,
  };
}

function start() {
  const aurelia = new Aurelia(new WebpackLoader());
    
  aurelia.host = pal.DOM.querySelectorAll('body')[0];

  const attribute = pal.DOM.createAttribute('aurelia-app');
  attribute.value = 'main';
  aurelia.host.attributes.setNamedItem(attribute);
  
  return new Promise(resolve => {
    // we need to wait for aurelia-composed as otherwise
    // the router hasn't been fully initialized and 
    // generated routes by route-href will be undefined
    pal.DOM.global.window.addEventListener('aurelia-composed', () => {
      resolve({ aurelia, pal, palNodeJS, stop });
    });
    
    return configure(aurelia);
  });;
}

function stop() {
  require('aurelia-pal').reset();
  require('aurelia-pal-nodejs').reset(pal.DOM.global.window);

  // stop the dirty checker, otherwise nodejs won't garbage collect the app
  // due to the timer that depends on code inside the app
  // as long as timer runs nodejs won't gc
  const container = Container.instance;
  const dirtyChecker = Container.instance.get(DirtyChecker);
  dirtyChecker.destruct();
}

export {
  initialize,
  stop,
  start
};