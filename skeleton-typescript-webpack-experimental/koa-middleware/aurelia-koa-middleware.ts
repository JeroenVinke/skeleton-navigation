
import {RenderOptions, AppInitializationOptions} from '../ssr-engine/interfaces';

export let aureliaKoaMiddleware = (renderOptions: RenderOptions, initializationOptions?: AppInitializationOptions) => {
  return (ctx, next) => {
    const pathname = ctx.request.URL.pathname;

    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (pathname.match(extensionMatcher)) {
      return next();
    }
    
    delete require.cache[require.resolve('../dist/server.bundle')];
    const {render} = require('../dist/server.bundle');

    console.log('start render', new Date());
    return render(Object.assign({ url: ctx.request.URL }, renderOptions), initializationOptions)
    .then(html => {
      let children = module.children;
      for(let i = children.length - 1; i >= 0; i--) {
        if (children[i].filename.indexOf('server.bundle') > -1) {
          module.children.splice(i, 1);
        }
      }
      global.gc();
      ctx.body = html;
      console.log('body set', new Date());
    })
    .catch(e => {
      ctx.body = `<html><body>Failed to render ${pathname}</body></html>`;
      console.log(`Failed to render ${pathname}`);
      console.log(e);
    });
  } 
};