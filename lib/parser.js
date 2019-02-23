"use strict";
exports.__esModule = true;
function ParseRegex(text, regex, parse) {
    var result = new RegExp(regex, "g").exec(text);
    if (result == null) {
        return null;
    }
    else {
        return {
            index: result.index,
            length: result[0].length,
            data: parse(result.map(function (x) { return x; }))
        };
    }
}
exports.ParseRegex = ParseRegex;
/**Find the next match of a given list of named parser functions */
function firstMatch(code, functions) {
    var firstMatch = null;
    for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
        var func = functions_1[_i];
        var match = func(code);
        if (match && (firstMatch == null || match.index < firstMatch.index)) {
            firstMatch = match;
        }
    }
    return firstMatch;
}
exports.firstMatch = firstMatch;
function subStrMatch(match, index) {
    return {
        data: match.data,
        index: match.index + index,
        length: match.length
    };
}
/**Find all matches in a text block. Unmatched text is returned as a ParseResult with an undefined data */
function allMatches(code, func) {
    var index = 0;
    var ret = [];
    while (true) {
        var substr = code.substr(index);
        var matchOrNull = func(substr);
        if (matchOrNull == null)
            break;
        var nextMatch = subStrMatch(matchOrNull, index);
        //add the last unmatched code:
        ret.push({
            data: undefined,
            index: index,
            length: nextMatch.index - index
        });
        //add the matched code:
        ret.push(nextMatch);
        //increment the search index:
        index = nextMatch.index + nextMatch.length;
    }
    //add the last unmatched code:
    ret.push({
        data: undefined,
        index: index,
        length: code.length - index
    });
    //Filter empty unmatched code:
    var filtered = ret.filter(function (x) { return !(x.data == undefined && x.length == 0); });
    return filtered;
}
exports.allMatches = allMatches;
