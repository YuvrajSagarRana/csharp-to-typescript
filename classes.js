"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
var regexs = require("./regexs");
var types_1 = require("./types");
function parseInherits(code) {
    var types = types_1.splitTopLevel(code, [',']);
    return types;
}
exports.parseInherits = parseInherits;
function parseClass(code) {
    var modifier = compose_1.optional(compose_1.seq(compose_1.optional(compose_1.any(compose_1.seq(compose_1.cap(/public/), /\s+/), /private\s+/, /protected\s+/, /internal\s+/)), compose_1.optional(/\s+sealed\s+/), compose_1.optional(/\s+abstract\s+/)));
    var identifier = regexs.identifier, space = regexs.space, spaceOptional = regexs.spaceOptional, type = regexs.type, spaceOrLine = regexs.spaceOrLine;
    var classType = compose_1.cap(compose_1.any(/class\s+/, /interface\s+/, /struct\s+/));
    var className = compose_1.cap(identifier);
    var separator = compose_1.seq(/,/, compose_1.optional(spaceOrLine));
    var inherits = compose_1.optional(compose_1.seq(/\s+:\s/, compose_1.cap(compose_1.commas(type, separator))));
    var classRegex = compose_1.seq(modifier, classType, className, inherits);
    var match = classRegex.exec(code);
    if (!match) {
        return null;
    }
    else {
        return {
            index: match.index,
            length: match[0].length,
            data: {
                isPublic: match[1] === 'public',
                type: match[2],
                name: match[3],
                inherits: parseInherits(match[4] || '')
            }
        };
    }
}
exports.parseClass = parseClass;
