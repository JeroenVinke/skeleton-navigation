// import * as Koa from 'koa';
// import * as path from 'path';
// import * as gulp from 'gulp';
// import {paths} from '../paths';
// import {aureliaKoaMiddleware} from './external/aurelia-koa-middleware';

// var port = process.env.PORT || 8080;

// gulp.task('serve', () => {
//   const app = new Koa();

//   app.use(async (ctx, next) => {
//     console.log('Request URL: ' + ctx.request.URL.toString());
//     await next();        
//   });

//   app.use(aureliaKoaMiddleware({
//     preboot: true,
//     templateContext: {
//       title: 'Aurelia Server Side Rendering',
//       baseUrl: '/'
//     },
//     template: require('fs').readFileSync(path.resolve(paths.templateFile), 'utf-8')
//   }));

//   app.use(require('koa-static')(path.resolve(paths.root)));
//   app.use(require('koa-static')(path.resolve(paths.output)));

//   console.log('Starting server....');
//   app.listen(port);
//   console.log(`Listening at http://localhost:${port}/`);
// });