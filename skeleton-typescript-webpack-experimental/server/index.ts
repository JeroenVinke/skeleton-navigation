import * as path from 'path';
import {serve} from './serve';
import {initializeSSR} from './aurelia-ssr-renderer';

async function start(done) {
  // this causes Aurelia to be initialized server-side
  // and is optional. Without this statement Aurelia will be initialized
  // when the first request hits the web server
  await initializeSSR();

  await serve();

  done();
}

start(() => {
  process.stdin.resume(); // don't exit Node.js right away
});

process.on('unhandledRejection', function(reason, p) {
  console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason);
  console.log(reason.stack);
});