"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
var regexs = require("./regexs");
var config_1 = require("./config");
var type = regexs.type, identifier = regexs.identifier, space = regexs.space, spaceOrLineOptional = regexs.spaceOrLineOptional, spaceOrLine = regexs.spaceOrLine;
function parseParameters(code) {
    var parameter = compose_1.seq(compose_1.cap(type), spaceOrLine, compose_1.cap(identifier), compose_1.optional(spaceOrLine));
    var all = regexs.allMatches(code, parameter);
    return all.map(function (x) { return ({
        type: x[1],
        name: x[2]
    }); });
}
exports.parseParameters = parseParameters;
var _a = (function () {
    var modifier = compose_1.cap(compose_1.optional(compose_1.seq(compose_1.any(/public/, /private/, /protected/), spaceOrLine)));
    var async = compose_1.cap(compose_1.optional(compose_1.seq(/async/, spaceOrLine)));
    var parameter = compose_1.seq(type, spaceOrLine, identifier, compose_1.optional(spaceOrLine));
    var paramSeparator = compose_1.seq(/,/, compose_1.optional(spaceOrLine));
    var paramList = compose_1.seq(/\(/, compose_1.cap(compose_1.optional(compose_1.commas(parameter, paramSeparator))), /\)/);
    var methodType = compose_1.seq(compose_1.cap(type), spaceOrLine);
    var methodName = compose_1.seq(compose_1.cap(identifier), compose_1.optional(spaceOrLine));
    var body = compose_1.seq(spaceOrLineOptional, compose_1.cap(compose_1.neasted("{", "}", config_1.maxBodyDepth, false)));
    var method = compose_1.seq(modifier, async, methodType, methodName, paramList, body);
    var constructorCall = compose_1.optional(compose_1.seq(spaceOrLineOptional, /:/, spaceOrLineOptional, compose_1.any(/base/, /this/), spaceOrLineOptional, compose_1.neasted("(", ")", config_1.maxExpressionDepth, false)));
    var constructor = compose_1.seq(modifier, methodName, paramList, constructorCall, body);
    return { parseMethodRegex: method, parseConstructorRegex: constructor };
})(), parseMethodRegex = _a.parseMethodRegex, parseConstructorRegex = _a.parseConstructorRegex;
function parseConstructor(code) {
    var method = parseConstructorRegex;
    var match = method.exec(code);
    if (!match) {
        return null;
    }
    else {
        return {
            index: match.index,
            length: match[0].length,
            data: {
                modifier: match[1],
                name: match[2],
                parameters: parseParameters(match[3]),
                body: match[4]
            }
        };
    }
}
exports.parseConstructor = parseConstructor;
function parseMethod(code) {
    //Regex captures:
    //modifier
    //async
    //type
    //name
    //paramList
    //body
    var method = parseMethodRegex;
    var match = method.exec(code);
    if (!match) {
        return null;
    }
    else {
        return {
            index: match.index,
            length: match[0].length,
            data: {
                modifier: match[1],
                async: !!match[2],
                returnType: match[3],
                name: match[4],
                parameters: parseParameters(match[5]),
                body: match[6]
            }
        };
    }
}
exports.parseMethod = parseMethod;
