"use strict";
exports.__esModule = true;
var tokenizer_1 = require("../tokenizer");
var Core;
(function (Core) {
    var Element = /** @class */ (function () {
        function Element(parent) {
            this.parent = parent;
        }
        Element.prototype.getLastContentElement = function () {
            var _a;
            return (_a = this.content) === null || _a === void 0 ? void 0 : _a.at(-1);
        };
        Element.prototype.toContent = function (token) {
            var element = this.getLastContentElement();
            this.content = this.content || [];
            if (token instanceof Element)
                return this.content.push(token);
            if (element instanceof Element)
                this.content.push([token]);
            else
                element.push(token);
        };
        Element.prototype.initializeContent = function () {
            this.content = this.content || [];
        };
        Element.prototype.toTag = function (tag) {
            if (this.tag)
                this.toContent(this.tag);
            this.tag = tag;
        };
        Element.prototype.hasTag = function () {
            return this.tag !== undefined;
        };
        return Element;
    }());
    Core.Element = Element;
    function geLastToken(tokens, i) {
        if (i === 0)
            return tokens[0];
        while (i-- && tokens[i].type === 1 /* Tokenizer.TokenType.space */)
            ;
        return tokens[i];
    }
    var Compilation = /** @class */ (function () {
        function Compilation(success, description, position) {
            this.isSuccess = success;
            if (position && description.endsWith('at'))
                description += " ".concat(position.y, ":").concat(position.x);
            this.description = description;
            this.errorPosition = position;
        }
        Compilation.prototype.setElements = function (elements) {
            this.elements = elements;
            return this;
        };
        return Compilation;
    }());
    Core.Compilation = Compilation;
    function compile(source) {
        if (source.length === 0)
            return new Compilation(true, 'Source empty');
        var tokens = tokenizer_1.Tokenizer.tokenizate(source), token;
        var x = 0, y = 0, bra = 0, cor = 0, par = 0;
        var result = [];
        var element = new Element();
        if (tokens[0].type === 9 /* Tokenizer.TokenType.eof */)
            return new Compilation(true, 'Source empty');
        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            switch (true) {
                case token.type === 7 /* Tokenizer.TokenType.separator */:
                    switch (token.text) {
                        case '{':
                            bra++;
                            if (element.hasTag())
                                element.initializeContent();
                            element = new Element(element);
                            break;
                        case '(':
                            break;
                        case '[':
                            break;
                        case '}':
                            if (--bra < 0)
                                return new Compilation(false, 'Invalid separator "}" at', token.pos);
                            element = element.parent;
                            break;
                        case ')':
                            break;
                        case ']':
                            break;
                    }
                    element.toTag(undefined);
                    break;
                case cor > 0:
                    break;
                case token.type === 3 /* Tokenizer.TokenType.identifier */:
                    element.toTag(token);
                    break;
                default:
                    if (token.type !== 1 /* Tokenizer.TokenType.space */ && token.type !== 8 /* Tokenizer.TokenType.eol */) { }
                    else
                        element.toTag(undefined);
            }
        }
        return (new Compilation(true, 'Source compiled succefully')).setElements(result);
    }
    Core.compile = compile;
})(Core || (Core = {}));
var source = "\nhtml {\n    head {\n        title{This is a simple title}\n    }\n    This is the first raw content that you should be able to read without problem\n\n    body {\n        [This is a comment]\n        main {\n            {<h1>This is title</h1>}\n        }\n    }\n\n    This is a raw content\n}\n";
console.log('qwdqwd');
