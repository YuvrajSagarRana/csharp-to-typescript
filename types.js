"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
var regexs_1 = require("./regexs");
var CsTypeCategory;
(function (CsTypeCategory) {
    /**A type that can be represented as a collection of items */
    CsTypeCategory[CsTypeCategory["Enumerable"] = 0] = "Enumerable";
    /**A dictionary is equivalent to a typescript object */
    CsTypeCategory[CsTypeCategory["Dictionary"] = 1] = "Dictionary";
    /**A c$# nullable type where the value type is the first generic type */
    CsTypeCategory[CsTypeCategory["Nullable"] = 2] = "Nullable";
    /**A c# tuple */
    CsTypeCategory[CsTypeCategory["Tuple"] = 3] = "Tuple";
    /**A boolean type */
    CsTypeCategory[CsTypeCategory["Boolean"] = 4] = "Boolean";
    /**A numeric type */
    CsTypeCategory[CsTypeCategory["Number"] = 5] = "Number";
    /**A 1-dimension byte array */
    CsTypeCategory[CsTypeCategory["ByteArray"] = 6] = "ByteArray";
    /**A date type */
    CsTypeCategory[CsTypeCategory["Date"] = 7] = "Date";
    /**A string type */
    CsTypeCategory[CsTypeCategory["String"] = 8] = "String";
    /**Any type */
    CsTypeCategory[CsTypeCategory["Any"] = 9] = "Any";
    /**Unidentified type */
    CsTypeCategory[CsTypeCategory["Other"] = 10] = "Other";
    /**Task/promise task */
    CsTypeCategory[CsTypeCategory["Task"] = 11] = "Task";
})(CsTypeCategory || (CsTypeCategory = {}));
/**Check if the given type is a simple that that passes as an uri parameter */
function isUriSimpleType(x) {
    var simpleCats = [
        CsTypeCategory.Boolean,
        CsTypeCategory.Number,
        CsTypeCategory.Date,
        CsTypeCategory.String,
    ];
    var isSimpleCat = function (x) { return simpleCats.indexOf(x) != -1; };
    var typeCat = getTypeCategory(x);
    if (isSimpleCat(typeCat)) {
        return true;
    }
    else if (typeCat == CsTypeCategory.Nullable && isSimpleCat(getTypeCategory(x.generics[0]))) {
        return true;
    }
    return false;
}
exports.isUriSimpleType = isUriSimpleType;
function getTypeCategory(x) {
    var byteTypeName = ['byte', "Byte", "System.Byte"];
    //Check if the type is byteArray
    if (byteTypeName.indexOf(x.name) != -1 && x.generics.length == 0 && x.array.length == 1 && x.array[0].dimensions == 1) {
        return CsTypeCategory.ByteArray;
    }
    var categories = [
        {
            category: CsTypeCategory.Enumerable,
            types: ["List", "ObservableCollection", "Array", "IEnumerable", "IList", "IReadOnlyList", "Collection", "ICollection", "ISet", "HashSet"],
            genericMin: 0,
            genericMax: 1
        }, {
            category: CsTypeCategory.Nullable,
            types: ["Nullable", "System.Nullable"],
            genericMin: 1,
            genericMax: 1
        }, {
            category: CsTypeCategory.Dictionary,
            types: ["Dictionary", "IDictionary", "IReadOnlyDictionary"],
            genericMin: 2,
            genericMax: 2
        }, {
            category: CsTypeCategory.Boolean,
            types: ["bool", "Boolean", "System.Boolean"],
            genericMin: 0,
            genericMax: 0
        }, {
            category: CsTypeCategory.Number,
            types: [
                'int', "Int32", "System.Int32",
                'float', "Single", "System.Single",
                "double", "Double", "System.Double",
                'decimal', "Decimal", "System.Decimal",
                'long', "Int64", "System.Int64"
            ].concat(byteTypeName, [
                'sbyte', "SByte", "System.SByte",
                'short', "Int16", "System.Int16",
                'ushort', "UInt16", "System.UInt16",
                'ulong', "UInt64", "System.UInt64"
            ]),
            genericMin: 0,
            genericMax: 0
        }, {
            category: CsTypeCategory.Date,
            types: ["DateTime", "System.DateTime", "DateTimeOffset", "System.DateTimeOffset"],
            genericMin: 0,
            genericMax: 0
        }, {
            category: CsTypeCategory.String,
            types: ["Guid", "string", "System.String", "String"],
            genericMin: 0,
            genericMax: 0
        }, {
            category: CsTypeCategory.Any,
            types: ["object", "System.Object", "dynamic"],
            genericMin: 0,
            genericMax: 0
        }, {
            category: CsTypeCategory.Task,
            types: ["Task", "System.Threading.Tasks.Task"],
            genericMin: 0,
            genericMax: 1
        }, {
            category: CsTypeCategory.Tuple,
            types: ["Tuple", "System.Tuple"],
            genericMin: 1,
            genericMax: 1000
        }
    ];
    var cat = categories.filter(function (cat) { return cat.types.indexOf(x.name) != -1 && x.generics.length >= cat.genericMin && x.generics.length <= cat.genericMax; })[0];
    return cat ? cat.category : CsTypeCategory.Other;
}
exports.getTypeCategory = getTypeCategory;
function convertToTypescript(x, config) {
    if (config.byteArrayToString && getTypeCategory(x) == CsTypeCategory.ByteArray) {
        return "string";
    }
    var arrayStr = "";
    for (var _i = 0, _a = x.array; _i < _a.length; _i++) {
        var a = _a[_i];
        arrayStr += "[";
        for (var i = 1; i < a.dimensions; i++) {
            arrayStr += ",";
        }
        arrayStr += "]";
    }
    return convertToTypescriptNoArray(x, config) + arrayStr;
}
exports.convertToTypescript = convertToTypescript;
function convertToTypescriptNoArray(value, config) {
    var category = getTypeCategory(value);
    switch (category) {
        case CsTypeCategory.Enumerable: {
            if (value.generics.length == 0) {
                return "any[]";
            }
            else if (value.generics.length == 1) {
                return convertToTypescript(value.generics[0], config) + "[]";
            }
            else {
                throw "";
            }
        }
        case CsTypeCategory.Dictionary: {
            var keyType = (getTypeCategory(value.generics[0]) == CsTypeCategory.Number) ? "number" : "string";
            return "{ [key: " + keyType + "]: " + convertToTypescript(value.generics[1], config) + " }";
        }
        case CsTypeCategory.Nullable: {
            return convertToTypescript(value.generics[0], config) + " | null";
        }
        case CsTypeCategory.Tuple: {
            var x = void 0;
            var tupleElements = value.generics.map(function (v, i) { return "Item" + (i + 1) + ": " + convertToTypescript(v, config); });
            var join = tupleElements.reduce(function (a, b) { return a ? a + ", " + b : b; }, "");
            return "{ " + join + " }";
        }
        case CsTypeCategory.Task: {
            var promLike = function (t) { return "Promise<" + t + ">"; };
            return value.generics.length == 0 ? promLike("void") : promLike(convertToTypescript(value.generics[0], config));
        }
        case CsTypeCategory.Boolean: {
            return "boolean";
        }
        case CsTypeCategory.Number:
        case CsTypeCategory.ByteArray: {
            return "number";
        }
        case CsTypeCategory.Date: {
            return config.dateToDateOrString ? "Date | string" : "Date";
        }
        case CsTypeCategory.String: {
            return "string";
        }
        case CsTypeCategory.Any: {
            return "any";
        }
        case CsTypeCategory.Other: {
            if (value.generics.length > 0) {
                var generics = value.generics.map(function (x) { return convertToTypescript(x, config); }).reduce(function (a, b) { return a ? a + ", " + b : b; }, "");
                return value.name + "<" + generics + ">";
            }
            else {
                return value.name;
            }
        }
    }
}
/**Split on top level by a given separator, separators inside < >, [ ], { } or ( ) groups are not considered
 *
 * @param separator One char separators
 */
function splitTopLevel(text, separators, openGroup, closeGroup) {
    if (openGroup === void 0) { openGroup = ["[", "(", "<", "{"]; }
    if (closeGroup === void 0) { closeGroup = ["]", ")", ">", "}"]; }
    var ret = [];
    var level = 0;
    var current = "";
    for (var i = 0; i < text.length; i++) {
        var char = text.charAt(i);
        if (openGroup.indexOf(char) != -1) {
            level++;
        }
        if (closeGroup.indexOf(char) != -1) {
            level--;
        }
        if (level == 0 && separators.indexOf(char) != -1) {
            ret.push(current);
            current = "";
        }
        else {
            current += char;
        }
    }
    if (current != "")
        ret.push(current);
    return ret;
}
exports.splitTopLevel = splitTopLevel;
/**Split on top level commas */
function splitCommas(text) {
    return splitTopLevel(text, [","]);
}
/**Parse an array definition */
function parseArray(code) {
    var ret = [];
    for (var i = 0; i < code.length; i++) {
        var char = code.charAt(i);
        if (char == "[") {
            ret.push({ dimensions: 1 });
        }
        if (char == "," && ret.length) {
            ret[ret.length - 1].dimensions++;
        }
    }
    return ret;
}
/**Parse a C# type, returns null if the given type could not be parsed */
function parseType(code) {
    //Remove all spaces:
    code = code.replace(" ", "");
    var patt = compose_1.seq(compose_1.cap(regexs_1.identifier), regexs_1.spaceOptional, compose_1.optional(/<(.*)>/), regexs_1.spaceOptional, compose_1.cap(compose_1.optional(/\?/)), regexs_1.spaceOptional, compose_1.zeroOrMore(compose_1.cap(/\[[,\[\]]*\]/)));
    var arr = patt.exec(code);
    if (!arr) {
        return null;
    }
    //Pattern groups:
    var name = arr[1];
    var genericsStr = splitCommas(arr[2] || "");
    var nullable = arr[3] == "?";
    var arraysStr = arr[4] || "";
    var arrays = parseArray(arraysStr);
    var genericsOrNull = genericsStr.map(function (x) { return parseType(x); });
    var genericParseError = genericsOrNull.filter(function (x) { return x == null; }).length > 0;
    if (genericParseError)
        return null;
    var generics = genericsOrNull.map(function (x) { return x; });
    if (nullable) {
        var underlyingType = { name: name, generics: generics, array: [] };
        return {
            name: "Nullable",
            generics: [underlyingType],
            array: arrays
        };
    }
    else {
        return { name: name, generics: generics, array: arrays };
    }
}
exports.parseType = parseType;
