"use strict";
exports.__esModule = true;
/**Return a regex that matches any of the given components */
function any() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    var sources = components.map(function (x) { return nonCap(x).source; });
    var sourceComb = sources.join("|");
    var combined = "(?:" + sourceComb + ")";
    return new RegExp(combined);
}
exports.any = any;
/**Concat regexes */
function seq() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return nonCap(new RegExp(components.map(function (x) { return x.source; }).join("")));
}
exports.seq = seq;
/**Enclose a regex on a non capturing group */
function nonCap(component) {
    return new RegExp("(?:" + component.source + ")");
}
exports.nonCap = nonCap;
/**Enclose a regex on a capturing group */
function cap(component) {
    return new RegExp("(" + component.source + ")");
}
exports.cap = cap;
/**Enclose a regex on an optional non capturing group */
function optional(component) {
    return new RegExp(nonCap(component).source + "?");
}
exports.optional = optional;
/**Enclose a regex on a zero or more repetition non capturing group */
function zeroOrMore(component) {
    return new RegExp(nonCap(component).source + "*");
}
exports.zeroOrMore = zeroOrMore;
/**Enclose a regex on a one or more repetition non capturing group */
function oneOrMore(component) {
    return new RegExp(nonCap(component).source + "+");
}
exports.oneOrMore = oneOrMore;
/**Return a regex that parses a list of items separated with the given separator.
 * For capturing also an empty list enclose the commas regex on an optional regex
 */
function commas(item, separator) {
    return seq(nonCap(item), zeroOrMore(seq(separator, item)));
}
exports.commas = commas;
/**Create a regex that matches the given string  */
function str(str) {
    return new RegExp(escapeRegExp(str));
}
exports.str = str;
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
/**Create an array with a range of numbers */
function range(start, count, step) {
    if (step === void 0) { step = 1; }
    var ret = [];
    for (var i = start; i < start + (count * step); i += step) {
        ret.push(i);
    }
    return ret;
}
/**Return a regex that parses a neasted expression
 * @param allowZeroDepth True to generate a regex that matches any text without the enclosing characters, false to make required at least one pair of enclosing characters
*/
function neasted(start, end, maxDepth, allowZeroDepth) {
    if (start.length != 1)
        throw new Error("start should be a single character");
    if (end.length != 1)
        throw new Error("end should be a single character");
    start = escapeRegExp(start);
    end = escapeRegExp(end);
    var bodyCharSource = "[^" + start + end + "]";
    var bodyChar = new RegExp(bodyCharSource);
    var zeroDepth = nonCap(oneOrMore(bodyChar));
    var repeat = function (s, n) { return range(0, n).map(function (x) { return s; }).join(""); };
    var nDepth = function (n) {
        return n == 0 ? zeroDepth :
            nonCap(new RegExp(repeat(start + bodyCharSource + "*", n - 1) + start + bodyCharSource + "*" + end + repeat(bodyCharSource + "*" + end, n - 1)));
    };
    var minDepth = allowZeroDepth ? 0 : 1;
    var allDepths = range(minDepth, maxDepth + 1 - minDepth).map(function (i) { return nDepth(i); });
    var ret = any.apply(void 0, allDepths);
    return ret;
}
exports.neasted = neasted;
