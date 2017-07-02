import {minify} from 'html-minifier';
import {RenderOptions, TransformerContext} from '../interfaces';

export default function (html: string, transformerCtx: TransformerContext, options: RenderOptions) {
  console.log(options.minifyHtml);
  if (options.minifyHtml) {
    return minify(html, Object.assign({
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    }, options.minifyOptions));
  }

  return html;
};