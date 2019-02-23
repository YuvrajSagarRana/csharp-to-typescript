"use strict";
exports.__esModule = true;
var types = require("./types");
function generateType(type, config) {
    var parseType = types.parseType(type);
    return trimMemberName(parseType ? types.convertToTypescript(parseType, config) : type, config);
}
function generateParam(value, config) {
    var tsType = generateType(value.type, config);
    return value.name + ": " + tsType;
}
function generateControllerBody(name, params) {
    var isUriSimpleType = function (x) {
        var parseType = types.parseType(x.type);
        return parseType && types.isUriSimpleType(parseType);
    };
    var simpleParams = params.filter(isUriSimpleType).map(function (x) { return x.name; }).join(", ");
    var bodyParams = params.filter(function (x) { return !isUriSimpleType(x); }).map(function (x) { return x.name; }).join(", ");
    if (bodyParams.length == 0) {
        return " => await controller('" + name + "', {" + simpleParams + "}), ";
    }
    else {
        return " => await controller('" + name + "', {" + simpleParams + "}, " + bodyParams + "), ";
    }
}
function generateMethod(value, config) {
    var paramList = value.parameters.map(function (x) { return generateParam(x, config); }).join(", ");
    var returnType = generateType(value.returnType, config);
    var fullType = "(" + paramList + "): " + returnType;
    var lambdaBody = (value.name + ": " + (value.async ? "async " : "")) + fullType;
    return (config.methodStyle == "signature" ? (value.name + fullType + ";") :
        config.methodStyle == "lambda" ? lambdaBody + " => { throw new Error('TODO'); }, " :
            config.methodStyle == "controller" ? lambdaBody + generateControllerBody(value.name, value.parameters)
                : config.methodStyle);
}
exports.generateMethod = generateMethod;
function generateConstructor(value, config) {
    var paramList = value.parameters.map(function (x) { return generateParam(x, config); }).join(", ");
    return config.removeConstructors ? "" : ("new(" + paramList + "): " + value.name + ";");
}
exports.generateConstructor = generateConstructor;
var myClass = {
    myMethod: function (hola) {
        throw new Error("TODO: Implement me");
    }
};
/**Generate a typescript property */
function generateProperty(prop, config) {
    //trim spaces:
    var tsType = generateType(prop.type, config);
    var name = getTypescriptPropertyName(prop.name, config);
    var printInitializer = !config.ignoreInitializer && (!!prop.initializer);
    var removeNameRegex = config.removeNameRegex != "" && (new RegExp(config.removeNameRegex)).test(name);
    var removeModifier = config.removeWithModifier.indexOf(prop.modifier) != -1;
    var removeProp = removeNameRegex || removeModifier;
    var modifier = prop.modifier; //TODO: Convert C# modifiers to TS modifiers
    if (removeProp) {
        return "";
    }
    return ((config.preserveModifiers ? (modifier + " ") : "") +
        (printInitializer ?
            (name + ": " + tsType + " = " + prop.initializer + ";") :
            (name + ": " + tsType + ";")));
}
exports.generateProperty = generateProperty;
function generateClass(x, config) {
    var inheritsTypes = x.inherits.map(function (x) { return generateType(x, config); });
    var name = x.name;
    var modifier = (x.isPublic ? "export " : "");
    var keyword = config.classToInterface ? "interface" : "class";
    var prefix = "" + modifier + keyword + " " + name;
    if (inheritsTypes.length > 0) {
        return prefix + " extends " + inheritsTypes.join(", ");
    }
    else {
        return prefix;
    }
}
exports.generateClass = generateClass;
function getTypescriptPropertyName(name, config) {
    var isAbbreviation = name.toUpperCase() == name;
    name = trimMemberName(name, config);
    if (config.propertiesToCamelCase && !isAbbreviation) {
        return name[0] + name.substr(1);
    }
    return name;
}
function trimMemberName(name, config) {
    name = name.trim();
    var postfixes = config.trimPostfixes;
    if (!postfixes)
        return name;
    var trimRecursive = config.recursiveTrimPostfixes;
    var trimmed = true;
    do {
        trimmed = false;
        for (var _i = 0, postfixes_1 = postfixes; _i < postfixes_1.length; _i++) {
            var postfix = postfixes_1[_i];
            if (!name.endsWith(postfix))
                continue;
            name = trimEnd(name, postfix);
            if (!trimRecursive)
                return name;
            trimmed = true;
        }
    } while (trimmed); // trim recursive until no more occurrences will be found
    return name;
}
exports.trimMemberName = trimMemberName;
function trimEnd(text, postfix) {
    if (text.endsWith(postfix)) {
        return text.substr(0, text.length - postfix.length);
    }
    return text;
}
