"use strict";
exports.__esModule = true;
var Grammar = /** @class */ (function () {
    function Grammar(specification) {
        var specList = [];
        var lines = specification.split("\n");
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
            var termenial = tokens[0].trim();
            for (var _a = 0, specList_1 = specList; _a < specList_1.length; _a++) {
                var t = specList_1[_a];
                if (t[0] === termenial) {
                    throw new Error("Repeated termenial");
                }
            }
            //check for regex correctness
            var regEx = void 0;
            try {
                regEx = new RegExp(tokens[1].trim());
            }
            catch (e) {
                throw new Error("Invalid Regex: " + tokens[1]);
            }
            //add pair to the known list
            specList.push([termenial, regEx]);
        }
    }
    return Grammar;
}());
exports.Grammar = Grammar;
