"use strict";
exports.__esModule = true;
var compose_1 = require("./compose");
var regexs = require("./regexs");
var parser_1 = require("./parser");
;
function generateSimpleJsDoc(indent, content) {
    return indent + "/**" + content + " */";
}
exports.generateSimpleJsDoc = generateSimpleJsDoc;
/**
 * Generate a JS Doc
 * @param code
 * @param value
 */
function generateJsDoc(value) {
    var isSimpleComment = (function () {
        if (value.items.length == 3) {
            var isSummaryStart = function (x) { return x.type == "start" && x.tag == "summary"; };
            var isSummaryEnd = function (x) { return x.type == "end" && x.tag == "summary"; };
            var start = value.items[0];
            var content = value.items[1];
            var end = value.items[2];
            if (isSummaryStart(start) && isSummaryEnd(end) && content.type == "docStart") {
                return {
                    simple: true,
                    indent: start.space,
                    content: content.content
                };
            }
            else {
                return false;
            }
        }
    })();
    if (isSimpleComment) {
        return generateSimpleJsDoc(isSimpleComment.indent, isSimpleComment.content);
    }
    var items = value.items;
    if (items.length == 0)
        return "";
    var text = items.map(function (x, i) {
        var startChar = i == 0 ? "/**" : " * ";
        switch (x.type) {
            case "start":
            case "selfClosing": {
                var char = x.space != null ? startChar : "";
                var begin = "" + (x.space || "") + char;
                if (x.tag == "summary") {
                    return begin;
                }
                else {
                    return begin + "@" + x.tag + " " + x.attributes.map(function (x) { return x.value; }).join("") + " ";
                }
            }
            case "end":
                return "";
            case "docStart":
                return "" + x.space + startChar + x.content;
            case "emptyNode":
                return "";
            case "content":
                return x.text;
            default:
                return x;
        }
    });
    var withSpaces = items.filter(function (x) { return x && x.space != null; }).map(function (x) { return x.space; });
    var lastSpace = withSpaces[withSpaces.length - 1] || " ";
    var ret = text.join("") + lastSpace + " */";
    return ret;
}
exports.generateJsDoc = generateJsDoc;
/**Parse a C# XML Doc */
function parseXmlDocBlock(code) {
    var summaryBlockPatt = (function () {
        var comment = compose_1.str("///");
        var line = compose_1.seq(comment, /.*/);
        var lineJump = compose_1.seq(regexs.lineJump, /\s*/);
        var firstLine = compose_1.seq(/[ \t]*/, line);
        var nextLine = compose_1.seq(lineJump, line);
        var block = compose_1.seq(firstLine, compose_1.zeroOrMore(nextLine));
        return block;
    })();
    var parseNodeTag = (function () {
        var parsers = [
            parseEmptyNode,
            parseNodeStart,
            parseSelfClosingNode,
            parseNodeEnd,
            parseDocStart
        ];
        return function (code) { return parser_1.firstMatch(code, parsers); };
    })();
    var parseXml = function (code) { return parser_1.allMatches(code, parseNodeTag); };
    var toXmlContent = function (code, x) {
        return {
            space: undefined,
            text: code.substr(x.index, x.length),
            type: "content"
        };
    };
    var r = parser_1.ParseRegex(code, compose_1.cap(summaryBlockPatt), function (match) { return ({
        items: parseXml(match[1]).map(function (x) { return x.data ? x.data : toXmlContent(match[1], x); })
    }); });
    return r;
}
exports.parseXmlDocBlock = parseXmlDocBlock;
var attribRegex = function (captureGroups) {
    var capFunc = captureGroups ? compose_1.cap : function (x) { return x; };
    var body = /[^"]*/;
    return compose_1.seq(regexs.spaceOptional, capFunc(regexs.identifier), regexs.spaceOptional, compose_1.str("="), regexs.spaceOptional, compose_1.str("\""), capFunc(body), compose_1.str("\""));
};
function parseAttribute(code) {
    var attrib = attribRegex(true);
    return parser_1.ParseRegex(code, attrib, function (match) { return ({
        name: match[1],
        value: match[2]
    }); });
}
function parseAttributes(code) {
    var all = parser_1.allMatches(code, parseAttribute).filter(function (x) { return x.data != undefined; });
    return all.map(function (x) { return x.data; });
}
/**Encaja con el inicio de una linea de comentarios y captura la secuencia de espacios anterior a esta, incluyendo el salto de linea si es que hay */
var commentLineBegin = compose_1.seq(compose_1.cap(compose_1.seq(compose_1.optional(regexs.lineJump), regexs.spaceOptional)), compose_1.str("///"), regexs.spaceOptional);
var _a = (function () {
    var attrib = attribRegex(false);
    var attribs = compose_1.zeroOrMore(attrib);
    var nodeStart = function (nodeEnd) { return compose_1.seq(compose_1.optional(commentLineBegin), compose_1.str("<"), compose_1.cap(regexs.identifier), compose_1.cap(attribs), regexs.spaceOptional, compose_1.str(nodeEnd)); };
    var parseNode = function (type, nodeEnd) { return function (code) { return parser_1.ParseRegex(code, nodeStart(nodeEnd), function (match) { return ({
        space: match[1],
        tag: match[2],
        attributes: parseAttributes(match[3]),
        type: type
    }); }); }; };
    return {
        parseNodeStart: parseNode("start", ">"),
        parseSelfClosingNode: parseNode("selfClosing", "/>")
    };
})(), parseNodeStart = _a.parseNodeStart, parseSelfClosingNode = _a.parseSelfClosingNode;
function parseNodeEnd(code) {
    var nodeEnd = compose_1.seq(compose_1.optional(commentLineBegin), compose_1.str("</"), compose_1.cap(regexs.identifier), regexs.spaceOptional, compose_1.str(">"));
    return parser_1.ParseRegex(code, nodeEnd, function (match) { return ({
        space: match[1],
        tag: match[2],
        type: "end"
    }); });
}
function parseEmptyNode(code) {
    var emptyBegin = compose_1.seq(compose_1.str("<"), compose_1.cap(regexs.identifier), regexs.spaceOptional, compose_1.str(">"));
    var emptyEnd = compose_1.seq(compose_1.str("</"), regexs.identifier, regexs.spaceOptional, compose_1.str(">"));
    var patt = compose_1.seq(compose_1.optional(commentLineBegin), emptyBegin, regexs.spaceOptional, emptyEnd);
    return parser_1.ParseRegex(code, patt, function (match) { return ({
        type: "emptyNode",
        space: match[1],
        tag: match[2]
    }); });
}
function parseDocStart(code) {
    var patt = compose_1.seq(commentLineBegin, compose_1.cap(compose_1.zeroOrMore(/[^<\n\r]/)));
    return parser_1.ParseRegex(code, patt, function (match) { return ({
        type: "docStart",
        space: match[1],
        content: match[2]
    }); });
}
var text = "\n   \t /// <summary>\n    /// Obtiene todos los archivo ticket de un ticket, \n    /// sin incluir su contenido <see cref=\"hola\"/>\n    /// Hola\n    /// </summary>\n    /// <param name=\"idTicket\"></param>\n    /// <param name=\"otro\">Que rollo</param>\n    /// <returns></returns>\n   ";
parseXmlDocBlock(text);
