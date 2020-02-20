"use strict";
exports.__esModule = true;
var Token_1 = require("./Token");
var Tokenizer = /** @class */ (function () {
    function Tokenizer(lang) {
        this.gram = lang;
    }
    Tokenizer.prototype.setInput = function (str) {
        this.index = 0;
        this.parsed = [];
        this.input = str;
        this.line = 1;
    };
    Tokenizer.prototype.next = function () {
        for (var _i = 0, _a = this.gram.termenials; _i < _a.length; _i++) {
            var t = _a[_i];
            t.regex.lastIndex = this.index;
            var found = t.regex.exec(this.input);
            if (found) {
                var lexeme = found[0];
                this.index += lexeme.length;
                var line = this.line;
                for (var i = 0; i < lexeme.length; i++) {
                    if (lexeme.charAt(i) === "\n") {
                        this.line += 1;
                    }
                }
                if (t.name === "COMMENT" || t.name === "WHITESPACE") {
                    return this.next();
                }
                var token = new Token_1.Token(t.name, lexeme, line);
                this.parsed.push(token);
                return token;
            }
        }
        if (this.index >= this.input.length - 1) {
            return new Token_1.Token("$", "$", this.line);
        }
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
