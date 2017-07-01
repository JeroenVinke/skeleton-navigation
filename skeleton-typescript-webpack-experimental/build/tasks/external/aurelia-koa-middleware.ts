import {render, start} from './aurelia-ssr-renderer';
import {RenderOptions, AppInitializationOptions} from './interfaces';

export let aureliaKoaMiddleware = (renderOptions: RenderOptions, initializationOptions?: AppInitializationOptions) => {
  return (ctx, next) => {
    const pathname = ctx.request.URL.pathname;

    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (pathname.match(extensionMatcher)) {
      return next();
    }

    let promise = Promise.resolve();

    if (initializationOptions) {
      promise = start(initializationOptions);
    }

    return promise
    .then(() => render(Object.assign({ route: pathname }, renderOptions)))
    .then(html => {
      ctx.body = html;
    })
    .catch(e => {
      ctx.body = `<html><body>Failed to render ${pathname}</body></html>`;
      console.log(`Failed to render ${pathname}`);
      console.log(e);
    });
  } 
};