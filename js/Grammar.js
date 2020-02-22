"use strict";
exports.__esModule = true;
var Termenial_1 = require("./Termenial");
var Nontermenial_1 = require("./Nontermenial");
var Grammar = /** @class */ (function () {
    function Grammar(specification) {
        var lines = specification.split("\n");
        this.termenials = [];
        var i = 0;
        for (i; i < lines.length; i++) {
            //split line on arrow
            var l = lines[i].trim();
            if (l.length == 0)
                break;
            var tokens = l.split("->");
            //check if the arrow was there
            if (tokens.length != 2) {
                throw new Error("Invalid Line: " + l);
            }
            //check for repeat RHS
            var name_1 = tokens[0].trim();
            for (var _i = 0, _a = this.termenials; _i < _a.length; _i++) {
                var t = _a[_i];
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
        //add defualt whitespace termenial
        this.termenials.push(new Termenial_1.Termenial("WHITESPACE", /\s+/gy));
        //pasrse nonterminals
        this.nontermenials = [];
        var preProds = [];
        i++;
        for (i; i < lines.length; i++) {
            //split line on arrow
            var l = lines[i].trim();
            if (l.length == 0)
                break;
            var tokens = l.split("->");
            //check if the arrow was there
            if (tokens.length != 2) {
                throw new Error("Invalid Line: " + l);
            }
            var name_2 = tokens[0].trim();
            for (var _b = 0, _c = this.termenials; _b < _c.length; _b++) {
                var t = _c[_b];
                if (t.name === name_2) {
                    throw new Error(name_2 + "is declared as both a termenial and Non-Termential");
                }
            }
            var isDouble = false;
            for (var _d = 0, preProds_1 = preProds; _d < preProds_1.length; _d++) {
                var t = preProds_1[_d];
                if (t[0].name === name_2) {
                    isDouble = true;
                    t[1] += " | " + tokens[1];
                }
            }
            if (isDouble) {
                continue;
            }
            var nt = new Nontermenial_1.Nontermenial(name_2);
            preProds.push([nt, tokens[1]]);
            this.nontermenials.push(nt);
        }
        //resolve strings to productions
        var symbols = this.nontermenials.concat(this.termenials);
        for (var _e = 0, preProds_2 = preProds; _e < preProds_2.length; _e++) {
            var prodGroup = preProds_2[_e];
            var prods = prodGroup[1].split("|");
            for (var _f = 0, prods_1 = prods; _f < prods_1.length; _f++) {
                var p = prods_1[_f];
                var production = [];
                for (var _g = 0, _h = p.split(" "); _g < _h.length; _g++) {
                    var sym = _h[_g];
                    if (sym.length === 0) {
                        continue;
                    }
                    var found = false;
                    for (var _j = 0, symbols_1 = symbols; _j < symbols_1.length; _j++) {
                        var s = symbols_1[_j];
                        if (s.name === sym) {
                            found = true;
                            production.push(s);
                            break;
                        }
                    }
                    if (!found) {
                        throw new Error("Invalid symbol <" + sym + "> in production " + p + " for " + prodGroup[0].name);
                    }
                }
                prodGroup[0].productions.push(production);
            }
        }
        //check for contectedness
        var reachable = new Set();
        reachable.add(this.nontermenials[0]);
        while (true) {
            var i_1 = reachable.size;
            reachable.forEach(function (r) {
                if (r instanceof Nontermenial_1.Nontermenial) {
                    var nt = r;
                    for (var _i = 0, _a = nt.productions; _i < _a.length; _i++) {
                        var prod = _a[_i];
                        for (var _b = 0, prod_1 = prod; _b < prod_1.length; _b++) {
                            var s = prod_1[_b];
                            reachable.add(s);
                        }
                    }
                }
            });
            if (i_1 === reachable.size) {
                break;
            }
        }
        //minus 1 here becuase WHITESPACE symbol is never reachable
        if (reachable.size != symbols.length - 1) {
            throw new Error("Langauge includes unreachable symbols");
        }
    }
    return Grammar;
}());
exports.Grammar = Grammar;
