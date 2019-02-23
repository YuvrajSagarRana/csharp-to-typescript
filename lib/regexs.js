"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
exports.identifier = /[a-zA-Z\u00C0-\u00FF_][a-zA-Z\u00C0-\u00FF_0-9]*/;
exports.space = /\s+/;
exports.spaceOrLine = /(?:\s|\n|\r)+/;
exports.spaceOrLineOptional = /(?:\s|\n|\r)*/;
exports.spaceOptional = /\s*/;
exports.anyChar = /(?:.|\n|\r)/;
exports.spaceNotLine = /[ \t]/;
exports.lineJump = /(?:\r|\n|(?:\r\n)|(?:\n\r))/;
/**Regex que encaga con un tipo */
exports.type = (function () {
    var arrayDimension = compose_1.zeroOrMore(/\[,*\]/);
    var generic = /<[a-zA-Z\u00C0-\u00FF_0-9,.<>? \t\n\r\[\]]*>/;
    var type = compose_1.seq(compose_1.nonCap(exports.identifier), exports.spaceOptional, compose_1.optional(generic), exports.spaceOptional, compose_1.optional(/\?/), arrayDimension);
    return type;
})();
function allMatches(text, pattern) {
    var reg = new RegExp(pattern, "g");
    var match;
    var ret = [];
    while (match = reg.exec(text)) {
        ret.push(match);
    }
    return ret;
}
exports.allMatches = allMatches;
