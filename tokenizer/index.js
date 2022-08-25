"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Tokenizer = void 0;
var Tokenizer;
(function (Tokenizer) {
    var spaces = ' \t\r\n';
    var separators = ':;[](){},.';
    var operators = '+-/*^%';
    var numbers = '0123456789';
    var characters = 'abcdefghijklmnñopqrstuvwxyzáéíóúABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ';
    function resizeIf(list, token, type, char, pos) {
        if (token.type === 9 /* TokenType.eof */)
            token.type = type;
        if (type === 6 /* TokenType.operator */ && char === '-' && token.type === 3 /* TokenType.identifier */) { }
        else if (token.type === 7 /* TokenType.separator */ || token.type !== type) {
            list.push(token);
            return { text: '', pos: __assign({}, pos), type: type };
        }
        else if (token.type === type) { }
        return token;
    }
    function charToType(char) {
        var type = 0 /* TokenType.unknown */;
        switch (true) {
            case numbers.includes(char): return 5 /* TokenType.number */;
            case separators.includes(char): return 7 /* TokenType.separator */;
            case operators.includes(char): return 6 /* TokenType.operator */;
            case characters.includes(char): return 3 /* TokenType.identifier */;
            case spaces.includes(char):
                if (char === '\n')
                    return 8 /* TokenType.eol */;
                else
                    return 1 /* TokenType.space */;
        }
        return type;
    }
    function tokenizate(source) {
        var token = { text: '', pos: { x: 1, y: 1 }, type: 9 /* TokenType.eof */ };
        var result = [];
        var pos = { x: 1, y: 1 };
        var isString = false;
        var type = 0 /* TokenType.unknown */;
        for (var i = 0; i < source.length; i++) {
            var char = source[i];
            switch (true) {
                case char === '"':
                    if (isString = !isString)
                        token = resizeIf(result, token, 2 /* TokenType.string */, char, pos);
                    break;
                case isString:
                    break;
                case (type = charToType(char)) > 0 /* TokenType.unknown */:
                    // The next line is due to a TypeScript bug
                    // @ts-ignore
                    if (type === 8 /* TokenType.eol */)
                        pos.y++, pos.x = 1;
                    token = resizeIf(result, token, type, char, pos);
                    break;
                case char === '\r':
                    break;
            }
            token.text += char;
            pos.x++;
        }
        result.push(token);
        if (result.at(-1).type !== 9 /* TokenType.eof */)
            result.push({ text: '', type: 9 /* TokenType.eof */, pos: { x: 0, y: 0 } });
        return result;
    }
    Tokenizer.tokenizate = tokenizate;
})(Tokenizer = exports.Tokenizer || (exports.Tokenizer = {}));
// console.log(TinyML.Tokenizer.tokenizate(`w-      "- q
// d"{wq} 
// wd`));
