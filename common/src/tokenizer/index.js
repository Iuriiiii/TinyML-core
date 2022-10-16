"use strict";
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
        if (token.type === 9)
            token.type = type;
        if (type === 6 && char === '-' && token.type === 3) { }
        else if (type === 5 && token.type === 3) { }
        else if (token.type === 7 || token.type !== type) {
            list.push(token);
            return { text: '', pos: { ...pos }, type: type };
        }
        else if (token.type === type) { }
        return token;
    }
    function charToType(char, props) {
        let type = 0;
        switch (true) {
            case numbers.includes(char): return 5;
            case (props.separators || separators).includes(char): return 7;
            case (props.operators || operators).includes(char): return 6;
            case characters.includes(char): return 3;
            case (props.spaces || spaces).includes(char):
                if (char === '\n')
                    return 8;
                else
                    return 1;
        }
        return type;
    }
    function tokenizate(source, props = { spaces, operators, separators }) {
        let token = { text: '', pos: { x: 1, y: 1 }, type: 9 };
        let result = [];
        let pos = { x: 1, y: 1 };
        let isString = false;
        let type = 0;
        for (let i = 0; i < source.length; i++) {
            let char = source[i];
            switch (true) {
                case char === '"':
                    if (isString = !isString)
                        token = resizeIf(result, token, 2, char, pos);
                    break;
                case isString:
                    break;
                case (type = charToType(char, props)) > 0:
                    if (type === 8)
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
        if (result.at(-1).type !== 9)
            result.push({ text: '', type: 9, pos });
        return result;
    }
    Tokenizer.tokenizate = tokenizate;
})(Tokenizer = exports.Tokenizer || (exports.Tokenizer = {}));
//# sourceMappingURL=index.js.map