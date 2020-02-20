"use strict";
exports.__esModule = true;
var Termenial_1 = require("./Termenial");
var Grammar = /** @class */ (function () {
    function Grammar(specification) {
        var lines = specification.split("\n");
        this.termenials = [];
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var l = lines_1[_i];
            //split line on arrow
            l = l.trim();
            if (l.length == 0)
                continue;
            var tokens = l.split("->");
            //check if the arrow was there
            if (tokens.length != 2) {
                throw new Error("Invalid Line: " + l);
            }
            //check for repeat RHS
            var name_1 = tokens[0].trim();
            for (var _a = 0, _b = this.termenials; _a < _b.length; _a++) {
                var t = _b[_a];
                if (t.name === name_1) {
                    throw new Error("Repeated termenial");
                }
            }
            //check for regex correctness
            var regEx = void 0;
            try {
                regEx = new RegExp(tokens[1].trim(), "gy");
            }
            catch (e) {
                throw new Error("Invalid Regex: " + tokens[1]);
            }
            //add the termenial to list
            this.termenials.push(new Termenial_1.Termenial(name_1, regEx));
        }
        this.termenials.push(new Termenial_1.Termenial("WHITESPACE", /\s+/gy));
    }
    return Grammar;
}());
exports.Grammar = Grammar;
