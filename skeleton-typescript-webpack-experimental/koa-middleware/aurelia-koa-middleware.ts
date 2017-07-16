import {render} from '../ssr-engine/aurelia-ssr-engine';
import {RenderOptions, AppInitializationOptions} from '../ssr-engine/interfaces';

export let aureliaKoaMiddleware = (renderOptions: RenderOptions, initializationOptions?: AppInitializationOptions) => {
  return (ctx, next) => {
    const pathname = ctx.request.URL.pathname;

    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (pathname.match(extensionMatcher)) {
      return next();
    }

    let promise = Promise.resolve();
    console.log('start render', new Date());
    return render(Object.assign({ url: ctx.request.URL }, renderOptions), initializationOptions)
    .then(html => {
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