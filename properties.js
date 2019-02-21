"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
var regexs = require("./regexs");
function parseProperty(code) {
    var identifier = regexs.identifier, space = regexs.space, spaceOptional = regexs.spaceOptional, type = regexs.type, spaceOrLineOptional = regexs.spaceOrLineOptional;
    var propAttributes = compose_1.optional(compose_1.seq(compose_1.commas(compose_1.seq(/\[/, identifier, /.*/, /\]/), spaceOrLineOptional), spaceOrLineOptional));
    var propModifier = compose_1.optional(compose_1.seq(compose_1.cap(compose_1.seq(compose_1.optional(compose_1.any(/public/, /private/, /protected/, /internal/)), compose_1.optional(compose_1.any(/\s+new/, /\s+override/)))), /\s*/));
    var propName = compose_1.seq(compose_1.cap(identifier), spaceOptional);
    //Regex que captura el get set con initializador o el fat arrow
    var getSetOrFatArrow = (function () {
        var getSetModifier = compose_1.optional(compose_1.any(/internal/, /public/, /private/, /protected/));
        var get = compose_1.seq(getSetModifier, spaceOptional, /get\s*;/);
        var set = compose_1.seq(getSetModifier, spaceOptional, /set\s*;/);
        var initializer = compose_1.optional(compose_1.seq(spaceOptional, /=/, spaceOptional, compose_1.cap(/.*/), /;/));
        var getSet = compose_1.seq(/{/, spaceOptional, get, spaceOptional, compose_1.optional(set), spaceOptional, /}/, initializer);
        var fatArrow = /=>.*;/;
        var getSetOrFatArrow = compose_1.any(getSet, fatArrow);
        return getSetOrFatArrow;
    })();
    var member = (function () {
        var initializer = compose_1.optional(compose_1.seq(spaceOptional, /=/, spaceOptional, compose_1.cap(/.*/)));
        var ending = /;/;
        var member = compose_1.seq(initializer, ending);
        return member;
    })();
    //Regex que captura a toda la propiedad:
    var prop = compose_1.seq(propAttributes, propModifier, compose_1.seq(compose_1.cap(type), space), propName, compose_1.cap(compose_1.any(getSetOrFatArrow, member)));
    var match = prop.exec(code);
    if (!match) {
        return null;
    }
    else {
        var isProperty = getSetOrFatArrow.test(match[4]);
        var isMember = !isProperty;
        return {
            index: match.index,
            length: match[0].length,
            data: {
                modifier: match[1],
                type: match[2],
                name: match[3],
                initializer: isMember ? match[6] : match[5],
                isField: isMember
            }
        };
    }
}
exports.parseProperty = parseProperty;
