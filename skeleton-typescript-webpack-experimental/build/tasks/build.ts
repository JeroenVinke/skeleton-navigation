import * as webpackConfig from '../../webpack.config';
import * as webpack from 'webpack';
import * as path from 'path';
import * as gulp from 'gulp';

gulp.task('build', () => {
  return new Promise<any>((resolve, reject) => {
    const config = webpackConfig({
      production: false, server: false, extractCss: true, coverage: false
    });
    const compiler = webpack(config);
    function onBuild(err, stats) {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        reject(err);
        process.exit(1);
      } else {
        process.stdout.write(stats.toString({ colors: require('supports-color') }) + '\n');

        resolve();
      }
    }
    console.log('Creating webpack bundles....');
    compiler.watch({}, onBuild);
    compiler.plugin('done', () => {
      console.log('Webpack bundles created');
    });
  });
});