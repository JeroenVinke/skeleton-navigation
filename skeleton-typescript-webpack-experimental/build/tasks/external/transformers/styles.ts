import {appendToHead, appendToBody} from './utils';
import {RenderOptions, TransformerContext} from '../interfaces';

export default function (html: string, transformerCtx: TransformerContext, options: RenderOptions) {
  let headStyleTags = Array.prototype.slice.call(document.head.querySelectorAll('style'));
  
  // copy over any style tags
  for(let i = 0; i < headStyleTags.length; i++) {
    html = appendToHead(html, headStyleTags[i].outerHTML);
  }

  return html;
};
