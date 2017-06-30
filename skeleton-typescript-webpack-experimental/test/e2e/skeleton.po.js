"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protractor_1 = require("aurelia-protractor-plugin/protractor");
var PageObject_Skeleton = (function () {
    function PageObject_Skeleton() {
    }
    PageObject_Skeleton.prototype.getCurrentPageTitle = function () {
        return protractor_1.browser.getTitle();
    };
    PageObject_Skeleton.prototype.navigateTo = function (href) {
        protractor_1.element(protractor_1.by.css('a[href="' + href + '"]')).click();
        return protractor_1.browser.waitForRouterComplete();
    };
    return PageObject_Skeleton;
}());
exports.PageObject_Skeleton = PageObject_Skeleton;
