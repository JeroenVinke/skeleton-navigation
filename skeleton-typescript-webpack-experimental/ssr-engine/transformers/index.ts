import {RenderOptions, TransformerContext} from '../interfaces';

export function transform(html: string, transformerCtx: TransformerContext, options: RenderOptions) {
  let transformers = [
    require('./template').default,
    require('./title').default,
    require('./styles').default,
    require('./preboot').default,
    require('./minify').default
  ];

  for(let i = 0; i < transformers.length; i++) {
    html = transformers[i](html, transformerCtx, options);
  }

  return html;
}