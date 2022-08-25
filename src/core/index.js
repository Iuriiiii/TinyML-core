"use strict";
exports.__esModule = true;
var tokenizer_1 = require("../tokenizer");
var Core;
(function (Core) {
    var Element = /** @class */ (function () {
        function Element() {
        }
        Element.prototype.getRaw = function () {
            return this.raw.map(function (element) { return element.text; }).join('');
        };
        return Element;
    }());
    function geLastToken(tokens, i) {
        if (i === 0)
            return tokens[0];
        while (i-- && tokens[i].type === 1 /* Tokenizer.TokenType.space */)
            ;
        return tokens[i];
    }
    function compile(source) {
        if (source.length === 0)
            return [];
        var tokens = tokenizer_1.Tokenizer.tokenizate(source), token, lastIdentifier;
        var x = 0, y = 0, bra = 0, cor = 0, par = 0;
        var element = new Element();
        if (tokens[0].type === 9 /* Tokenizer.TokenType.eof */)
            return [];
        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            switch (true) {
                case token.type === 7 /* Tokenizer.TokenType.separator */:
                    switch (token.text) {
                        case '{':
                            break;
                        case '(':
                            break;
                        case '[':
                            break;
                        case '}':
                            break;
                        case ')':
                            break;
                        case ']':
                            break;
                    }
                    break;
                default:
                    if (token.type === 3 /* Tokenizer.TokenType.identifier */)
                        lastIdentifier = token;
                    else if (token.type !== 1 /* Tokenizer.TokenType.space */ && token.type !== 8 /* Tokenizer.TokenType.eol */)
                        lastIdentifier = null;
                    element.raw.push(tokens[i]);
            }
        }
        return [];
    }
})(Core || (Core = {}));
