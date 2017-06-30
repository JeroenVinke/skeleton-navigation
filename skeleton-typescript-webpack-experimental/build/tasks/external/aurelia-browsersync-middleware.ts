import {render} from './aurelia-ssr-renderer';
import {RenderOptions} from './interfaces';

function aureliaBrowserSyncMiddleware (renderOptions: RenderOptions) {
  return function (req, res, next) {
    const pathname = req.originalUrl;

    // skip requests where urls have an extension
    let extensionMatcher = /^.*\.[^\\]+$/;
    if (pathname.match(extensionMatcher)) {
      return next();
    }

    return render(Object.assign({ route: pathname }, renderOptions))
    .then(html => {
      // just to indicate when server-view is active
      html = html.replace('collapse navbar-collapse', 'collapse navbar-collapse green');

      res.write(html);
    })
    .catch((e) => {
      res.write(`<html><body>Failed to render ${pathname}</body></html>`);
      console.log(`Failed to render ${pathname}`);
      console.log(e);
    })
    .then(res.end);
  };
};


export { aureliaBrowserSyncMiddleware };