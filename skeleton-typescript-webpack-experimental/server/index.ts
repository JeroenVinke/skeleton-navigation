import {serve} from './serve';
import {initializeSSR} from './aurelia-ssr-renderer';

async function start(done) {
  // this causes Aurelia to be initialized server-side
  // and is optional. Without this statement Aurelia will be initialized
  // when the first request hits the web server
  await initializeSSR({
    clientMainId: 'main',
    serverMainId: 'main'
  });
  await serve();
  done();
}

start(() => {
  process.stdin.resume();
});

process.on('unhandledRejection', function(reason, p) {
  console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason);
  console.log(reason.stack);
});