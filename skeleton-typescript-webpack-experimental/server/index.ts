import {initializeSSR} from './aurelia-ssr';
import {build} from './build';
import {serve} from './serve';

var stylesheets = [];
var bundles = [];

async function start(done) {
  await initializeSSR({ 
    clientMainId: 'main',
    serverMainId: 'main'
  });
  let assets = await build();
  await serve(assets);
  done();
}

start(() => {
  process.stdin.resume();
});

process.on('unhandledRejection', function(reason, p) {
  console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason);
  console.log(reason.stack);
});