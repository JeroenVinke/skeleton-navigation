import {render} from './aurelia-ssr-renderer';
import * as ejs from 'ejs';
import {RenderOptions} from './interfaces';

export let aureliaKoaMiddleware = (renderOptions: RenderOptions) => {
  return async (ctx, next) => {
    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (ctx.request.path.match(extensionMatcher)) {
      await next();
      return;
    }

    try {
      let html = await render(Object.assign({ route: ctx.request.URL.pathname }, renderOptions));

      // just to indicate when server-view is active
      html = html.replace('collapse navbar-collapse', 'collapse navbar-collapse green');

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