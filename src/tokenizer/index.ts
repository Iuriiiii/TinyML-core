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

export const enum TokenType {
    UNKNOWN,
    SPACE,
    STRING,
    IDENTIFIER,
    INSTRUCTION,
    NUMBER,
    OPERATOR,
    SEPARATOR,
    EOL,
    EOF
}

export type TokenPosition = {
    x: number,
    y: number
}

export interface Token {
    text: string,
    pos: TokenPosition
    type: TokenType
}
export namespace Tokenizer {

    const spaces = ' \t\r\n' as const;
    const separators = '\\:;[](){},.' as const;
    const operators = '+-/*^%=!' as const;
    const numbers = '0123456789' as const;
    const characters = 'abcdefghijklmnñopqrstuvwxyzáéíóúABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ' as const;

    function resizeIf(list: Token[], token: Token, type: TokenType, char: string, pos: TokenPosition): Token {
        if (token.type === TokenType.EOF)
            return {...token, text: '', type};

        if (type === TokenType.OPERATOR && char === '-' && token.type === TokenType.IDENTIFIER) { }
        else if (type === TokenType.NUMBER && token.type === TokenType.IDENTIFIER) { }
        else if (token.type === TokenType.SEPARATOR || token.type !== type) {
            list.push(token);
            return { text: '', pos: { ...pos }, type: type };
        } else if (token.type === type) { }

        return token;
    }

    function charToType(char: string, props: IProps): TokenType {
        let type = TokenType.UNKNOWN;

        switch (true) {
            case numbers.includes(char): return TokenType.NUMBER;
            case (props.separators || separators).includes(char): return TokenType.SEPARATOR;
            case (props.operators || operators).includes(char): return TokenType.OPERATOR;
            case characters.includes(char): return TokenType.IDENTIFIER;
            case (props.spaces || spaces).includes(char):
                if (char === '\n')
                    return TokenType.EOL;
                else
                    return TokenType.SPACE;
        }

        return type;
    }

    interface IProps {
        spaces?: string
        operators?: string
        separators?: string
    }

    export function tokenizate(source: string, props: IProps = { spaces, operators, separators }): Token[] {
        let token: Token = { text: 'EOF', pos: { x: 1, y: 1 }, type: TokenType.EOF };
        let result: Token[] = [];
        let pos: TokenPosition = { x: 1, y: 1 };
        let isString = false;
        let type = TokenType.UNKNOWN;

        for (let i = 0; i < source.length; i++) {
            let char = source[i];

            switch (true) {
                case char === '"':
                    if (isString = !isString)
                        token = resizeIf(result, token, TokenType.STRING, char, pos);

                    break;
                case isString:
                    break;
                case (type = charToType(char, props)) > TokenType.UNKNOWN:
                    // The next line is due to a TypeScript bug
                    // @ts-ignore
                    if (type === TokenType.EOL)
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

        if (result.at(-1).type !== TokenType.EOF)
            result.push({ text: 'EOF', type: TokenType.EOF, pos });

        return result;
    }
}