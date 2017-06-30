import * as path from 'path';
import * as gulp from 'gulp';
import {paths} from '../paths';
import {initializeSSR} from './external/aurelia-ssr-renderer';

gulp.task('init', async () => {
  // this causes Aurelia to be initialized server-side
  // and is optional. Without this statement Aurelia will be initialized
  // when the first request hits the web server
  await initializeSSR({
    srcRoot: path.resolve(paths.source)
  });
});

gulp.task('watch', gulp.series(['init', 'build', 'serve']));

gulp.task('default', gulp.series('watch'));