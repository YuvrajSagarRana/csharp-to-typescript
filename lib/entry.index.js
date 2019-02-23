'use strict';
exports.__esModule = true;
var properties_1 = require("./properties");
var methods_1 = require("./methods");
var generators_1 = require("./generators");
var commentDoc_1 = require("./commentDoc");
var classes_1 = require("./classes");
function csFunction(parse, generate) {
    return function (code, config) {
        var parseResult = parse(code);
        if (!parseResult) {
            return null;
        }
        else {
            return {
                result: generate(parseResult.data, config),
                index: parseResult.index,
                length: parseResult.length
            };
        }
    };
}
/**Convert a c# automatic or fat arrow property to a typescript property. Returns null if the string didn't match */
var csAutoProperty = csFunction(properties_1.parseProperty, generators_1.generateProperty);
/**Convert a C# method to a typescript method signature */
var csMethod = csFunction(methods_1.parseMethod, generators_1.generateMethod);
var csConstructor = csFunction(methods_1.parseConstructor, generators_1.generateConstructor);
var csCommentSummary = csFunction(commentDoc_1.parseXmlDocBlock, commentDoc_1.generateJsDoc);
var csClass = csFunction(classes_1.parseClass, generators_1.generateClass);
function csAttribute(code, config) {
    var patt = /[ \t]*\[\S*\][ \t]*\r?\n/;
    var arr = patt.exec(code);
    if (arr == null)
        return null;
    return {
        result: "",
        index: arr.index,
        length: arr[0].length
    };
}
function csPublicMember(code, config) {
    var patt = /public\s*(?:(?:abstract)|(?:sealed))?(\S*)\s+(.*)\s*{/;
    var arr = patt.exec(code);
    var tsMembers = {
        'class': 'interface',
        'struct': 'interface'
    };
    if (arr == null)
        return null;
    var tsMember = tsMembers[arr[1]];
    var name = generators_1.trimMemberName(arr[2], config);
    return {
        result: "export " + (tsMember || arr[1]) + " " + name + " {",
        index: arr.index,
        length: arr[0].length
    };
}
/**Find the next match */
function findMatch(code, startIndex, config) {
    code = code.substr(startIndex);
    var functions = [
        csClass,
        csAutoProperty,
        csConstructor,
        csMethod,
        csCommentSummary,
        csAttribute,
        csPublicMember
    ];
    var firstMatch = null;
    for (var i = 0; i < functions.length; i++) {
        var match = functions[i](code, config);
        if (match != null && (firstMatch == null || match.index < firstMatch.index)) {
            firstMatch = match;
        }
    }
    return firstMatch ? {
        result: firstMatch.result,
        index: firstMatch.index + startIndex,
        length: firstMatch.length
    } : null;
}
/**Convert c# code to typescript code */
function cs2ts(code, config) {
    var ret = "";
    var index = 0;
    while (true) {
        var nextMatch = findMatch(code, index, config);
        if (nextMatch == null)
            break;
        //add the last unmatched code:
        ret += code.substr(index, nextMatch.index - index);
        //add the matched code:
        ret += nextMatch.result;
        //increment the search index:
        index = nextMatch.index + nextMatch.length;
    }
    //add the last unmatched code:
    ret += code.substr(index);
    return ret;
}
exports.cs2ts = cs2ts;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getConfiguration(preserveModifier, methodType, changeToInterface) {
    /**True for camelCase, false for preserving original name */
    if (preserveModifier === void 0) { preserveModifier = false; }
    if (methodType === void 0) { methodType = 'signature'; }
    if (changeToInterface === void 0) { changeToInterface = false; }
    var propertiesToCamelCase = true;
    /**Removes specified postfixes from property names, types & class names. Can be array OR string. Case-sensitive. */
    var trimPostfixes = [];
    /**Whether or not trim postfixes recursive. (e.g. with postfixes 'A' & 'B' PersonAAB will become PersonAA when it's false & Person when it's true) */
    var recursiveTrimPostfixes = true;
    /**ignoreInitializer */
    var ignoreInitializer = true;
    /** True to remove method bodies, false to preserve the body as-is*/
    var removeMethodBodies = false;
    /**True to remove class constructors, false to treat then like any other method */
    var removeConstructors = true;
    /**'signature' to emit a method signature, 'lambda' to emit a lambda function. 'controller' to emit a lambda to call an async controller */
    var methodStyle /*: 'signature' | 'lambda' | 'controller'*/ = methodType ? methodType : 'signature';
    /**True to convert C# byte array type to Typescript string, defaults to true since the serialization of C# byte[] results in a string */
    var byteArrayToString = true;
    /**True to convert C# DateTime and DateTimeOffset to Typescript (Date | string), defaults to true since the serialization of C# DateTime results in a string */
    var dateToDateOrString = true;
    /**Remove fields or properties with the given modifiers. Ex. if you want to remove private and internal members set to ['private', 'internal'] */
    var removeWithModifier = [];
    /**If setted, any property or field that its name matches the given regex will be removed */
    var removeNameRegex = "";
    /**True to convert classes to interfaces, false to convert classes to classes. Default is true */
    var classToInterface = changeToInterface;
    /**True to preserve fields and property modifiers. Default is false */
    var preserveModifiers = preserveModifier;
    return {
        propertiesToCamelCase: propertiesToCamelCase,
        trimPostfixes: trimPostfixes,
        recursiveTrimPostfixes: recursiveTrimPostfixes,
        ignoreInitializer: ignoreInitializer,
        removeMethodBodies: removeMethodBodies,
        removeConstructors: removeConstructors,
        methodStyle: methodStyle,
        byteArrayToString: byteArrayToString,
        dateToDateOrString: dateToDateOrString,
        removeWithModifier: removeWithModifier,
        removeNameRegex: removeNameRegex,
        classToInterface: classToInterface,
        preserveModifiers: preserveModifiers
    };
}
exports.getConfiguration = getConfiguration;
