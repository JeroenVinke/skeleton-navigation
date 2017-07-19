"use strict";
/// <reference path="./jsdom.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
function polyfillWholeText() {
    /* function wholeText() {
       let wholeText = this.textContent;
       let next;
       let current = this;
       while ((next = domSymbolTree.previousSibling(current)) && next.nodeType === NODE_TYPE.TEXT_NODE) {
         wholeText = next.textContent + wholeText;
         current = next;
       }
       current = this;
       while ((next = domSymbolTree.nextSibling(current)) && next.nodeType === NODE_TYPE.TEXT_NODE) {
         wholeText += next.textContent;
         current = next;
       }
       return wholeText;
     };
     const implementationsToPolyfill = [TextImpl.prototype, Text.prototype] as Array<Object>;
     implementationsToPolyfill.forEach(implementation => {
       if (implementation.hasOwnProperty('wholeText')) return;
       Object.defineProperty(implementation, 'wholeText', {
         get: wholeText,
         enumerable: true,
         configurable: true
       });
     });*/
}
exports.polyfillWholeText = polyfillWholeText;

//# sourceMappingURL=jsdom-whole-text.js.map
