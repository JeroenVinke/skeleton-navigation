
import {RenderOptions, TransformerContext} from '../interfaces';

export default function (html: string, transformerCtx: TransformerContext, options: RenderOptions) {
  let title = transformerCtx.document.head.querySelector('title');

  return html.replace('<!-- title -->', title.innerHTML);
};

