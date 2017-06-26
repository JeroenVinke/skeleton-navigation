import * as webpackConfig from '../webpack.config';
import * as webpack from 'webpack';
import * as path from 'path';

async function build(): Promise<{ bundles: Array<string>, stylesheets: Array<string> }> {
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

        resolve({
          bundles: getAssets(stats, 'bundle.js'),
          stylesheets: getAssets(stats, '.css')
        });
      }
    }
    console.log('Creating webpack bundles....');
    compiler.watch({}, onBuild);
    compiler.plugin('done', () => {
      console.log('Webpack bundles created');
    });
  });
}

function getAssets(stats, suffix) {
  let assets = Object.keys(stats.compilation.assets);
  let outputDir = path.relative(path.resolve(__dirname, '..'), stats.compilation.outputOptions.path);
  let matching = assets.filter(name => name.endsWith(suffix));

  return matching.map(name => `${outputDir}/${name}`);
}

export { build };