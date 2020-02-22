"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Symbol_1 = require("./Symbol");
var Termenial = /** @class */ (function (_super) {
    __extends(Termenial, _super);
    function Termenial(name, regex) {
        var _this = _super.call(this, name) || this;
        _this.regex = regex;
        return _this;
    }
    return Termenial;
}(Symbol_1.Symbol));
exports.Termenial = Termenial;
