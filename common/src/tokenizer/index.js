"use strict";
/*
MIT License

Copyright (c) 2022 Iuriiiii

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
var Tokenizer;
(function (Tokenizer) {
    const spaces = ' \t\r\n';
    const separators = '\\:;[](){},.';
    const operators = '+-/*^%=!';
    const numbers = '0123456789';
    const characters = 'abcdefghijklmnñopqrstuvwxyzáéíóúABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ';
    function resizeIf(list, token, type, char, pos) {
        if (token.type === 9 /* TokenType.EOF */)
            return { ...token, text: '', type };
        if (type === 6 /* TokenType.OPERATOR */ && char === '-' && token.type === 3 /* TokenType.IDENTIFIER */) { }
        else if (type === 5 /* TokenType.NUMBER */ && token.type === 3 /* TokenType.IDENTIFIER */) { }
        else if (token.type === 7 /* TokenType.SEPARATOR */ || token.type !== type) {
            list.push(token);
            return { text: '', pos: { ...pos }, type: type };
        }
        else if (token.type === type) { }
        return token;
    }
    function charToType(char, props) {
        let type = 0 /* TokenType.UNKNOWN */;
        switch (true) {
            case numbers.includes(char): return 5 /* TokenType.NUMBER */;
            case (props.separators || separators).includes(char): return 7 /* TokenType.SEPARATOR */;
            case (props.operators || operators).includes(char): return 6 /* TokenType.OPERATOR */;
            case characters.includes(char): return 3 /* TokenType.IDENTIFIER */;
            case (props.spaces || spaces).includes(char):
                if (char === '\n')
                    return 8 /* TokenType.EOL */;
                else
                    return 1 /* TokenType.SPACE */;
        }
        return type;
    }
    function tokenizate(source, props = { spaces, operators, separators }) {
        let token = { text: 'EOF', pos: { x: 1, y: 1 }, type: 9 /* TokenType.EOF */ };
        let result = [];
        let pos = { x: 1, y: 1 };
        let isString = false;
        let type = 0 /* TokenType.UNKNOWN */;
        for (let i = 0; i < source.length; i++) {
            let char = source[i];
            switch (true) {
                case char === '"':
                    if (isString = !isString)
                        token = resizeIf(result, token, 2 /* TokenType.STRING */, char, pos);
                    break;
                case isString:
                    break;
                case (type = charToType(char, props)) > 0 /* TokenType.UNKNOWN */:
                    // The next line is due to a TypeScript bug
                    // @ts-ignore
                    if (type === 8 /* TokenType.EOL */)
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
        if (result.at(-1).type !== 9 /* TokenType.EOF */)
            result.push({ text: 'EOF', type: 9 /* TokenType.EOF */, pos });
        return result;
    }
    Tokenizer.tokenizate = tokenizate;
})(Tokenizer = exports.Tokenizer || (exports.Tokenizer = {}));
//# sourceMappingURL=index.js.map