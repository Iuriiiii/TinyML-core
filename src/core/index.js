"use strict";
exports.__esModule = true;
var tokenizer_1 = require("../tokenizer");
var Core;
(function (Core) {
    var Element = /** @class */ (function () {
        function Element(parent) {
            this.content = [];
            this.parent = parent;
        }
        Element.prototype.toParamContent = function (token) {
            this.params.content.push(token);
        };
        Element.prototype.declareParam = function (token) {
            this.params.values.push({ name: token, value: true });
        };
        Element.prototype.updateLastParam = function (value) {
            // this.params.values.at(-1).value = value.text;
        };
        Element.prototype.getLastContentElement = function () {
            return this.content.at(-1);
        };
        Element.prototype.toContent = function (token) {
            var element = this.getLastContentElement();
            if (token instanceof Element)
                this.content.push(token);
            else if (element instanceof Element || element === undefined)
                this.content.push([token]);
            else
                element.push(token);
            // console.log('this.content:', this.content, 'element:', element);
        };
        Element.prototype.initializeContent = function () {
            this.content = this.content || [];
        };
        Element.prototype.canHasTag = function () {
            var element = this.getLastContentElement();
            // console.log(element);
            if (element instanceof Element || element === undefined)
                return false;
            var lastToken = getLastIdentifierToken(element);
            if (lastToken === undefined)
                return false;
            this.tag = element.splice(lastToken, 1)[0];
            return true;
        };
        Element.prototype.hasTag = function () {
            return this.tag !== undefined;
        };
        return Element;
    }());
    Core.Element = Element;
    function getLastIdentifierToken(tokens) {
        var i = tokens.length;
        while (i-- && tokens[i].type === 1 /* Tokenizer.TokenType.space */)
            ;
        if (tokens[i].type !== 3 /* Tokenizer.TokenType.identifier */)
            return;
        return i;
    }
    var Compilation = /** @class */ (function () {
        function Compilation(success, description, position) {
            this.isSuccess = success;
            if (position && (description.endsWith('at') || description.endsWith('since')))
                description += " ".concat(position.y, ":").concat(position.x);
            this.description = description;
            this.errorPosition = position;
        }
        Compilation.prototype.setContent = function (content) {
            this.content = content;
            return this;
        };
        Compilation.prototype.toString = function () {
            return JSON.stringify(this, undefined, '  ');
        };
        return Compilation;
    }());
    Core.Compilation = Compilation;
    function compile(source) {
        var _a;
        if (source.length === 0)
            return new Compilation(true, 'Source empty');
        var tokens = tokenizer_1.Tokenizer.tokenizate(source, { separators: '[]{}()=;:', operators: '' }), token;
        var x = 0, y = 0, bra = [], cor = [], par = [];
        var element = new Element();
        var waitingValue = false;
        if (tokens[0].type === 9 /* Tokenizer.TokenType.eof */)
            return new Compilation(true, 'Source empty');
        f1: for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            switch (true) {
                case token.type === 9 /* Tokenizer.TokenType.eof */:
                    break f1;
                case token.type === 7 /* Tokenizer.TokenType.separator */:
                    switch (token.text) {
                        case '{':
                            bra.push(token);
                            element.canHasTag();
                            element = new Element(element);
                            break;
                        case '(':
                            par.push(token);
                            element.params = { content: [], values: [] };
                            break;
                        case '[':
                            break;
                        case '}':
                            if (bra.length === 0)
                                return new Compilation(false, 'Invalid separator "}" at', token.pos);
                            element.parent.toContent(element);
                            _a = [undefined, element.parent], element.parent = _a[0], element = _a[1];
                            bra.pop();
                            break;
                        case ')':
                            if (par.length === 0)
                                return new Compilation(false, 'Invalid separator ")" at', token.pos);
                            par.pop();
                            break;
                        case ']':
                            break;
                    }
                    break;
                case par.length > 0:
                    if (!waitingValue)
                        if (token.type !== 3 /* Tokenizer.TokenType.identifier */)
                            return new Compilation(false, 'Invalid token type at', token.pos);
                        else
                            element.declareParam(token);
                    else if (token.type !== 2 /* Tokenizer.TokenType.string */)
                        return new Compilation(false, 'Invalid token type at', token.pos);
                    else
                        element.updateLastParam(token);
                    break;
                default:
                    element.toContent(token);
            }
        }
        if (bra.length > 0)
            return new Compilation(false, 'Infinite code block detected since', bra.at(-1).pos);
        else if (par.length > 0)
            return new Compilation(false, 'Infinite parameters block detected since', par.at(-1).pos);
        else if (cor.length > 0)
            return new Compilation(false, 'Infinite comment since', bra.at(-1).pos);
        return (new Compilation(true, 'Source compiled succefully')).setContent(element.content);
    }
    Core.compile = compile;
})(Core || (Core = {}));
var source = " a thisisaTag(){\n    t html { q}\n}\n";
var result = Core.compile(source).toString();
console.log(result);
