import {render} from './aurelia-ssr';
import * as ejs from 'ejs';

export let aureliaKoaMiddleware = renderOptions => {
  return async (ctx, next) => {
    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (ctx.request.path.match(extensionMatcher)) {
      await next();
      return;
    }

    try {
      let html = await render(Object.assign({ route: ctx.request.URL.pathname }, renderOptions));
      ctx.body = html;
    } catch (e) {
      if (e.message === '404') {
        ctx.status = 404;

        if (renderOptions.notFoundTemplate) {
          ctx.body = ejs.compile(renderOptions.notFoundTemplate)({
            path: ctx.request.URL.pathname
          });
        } else {
          ctx.body = `<html><head><title>404 not found</title></head><body><h1>Page ${ctx.request.URL.pathname} not found</h1></body></html>`;
        }
      }
    }
  } 
};