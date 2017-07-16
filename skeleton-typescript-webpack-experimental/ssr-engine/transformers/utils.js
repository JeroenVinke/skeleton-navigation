"use strict";
exports.__esModule = true;
function appendToBody(htmlString, toAppend) {
    return htmlString.replace('</body>', toAppend + "</body>");
}
exports.appendToBody = appendToBody;
function appendToHead(htmlString, toAppend) {
    return htmlString.replace('</head>', toAppend + "</head>");
}
exports.appendToHead = appendToHead;
