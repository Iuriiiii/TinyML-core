
export namespace Tokenizer {
    export const enum TokenType {
        unknown,
        space,
        string,
        identifier,
        instruction,
        number,
        operator,
        separator,
        eol,
        eof
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

    const spaces = ' \t\r\n' as const;
    const separators = '\\:;[](){},.' as const;
    const operators = '+-/*^%=!' as const;
    const numbers = '0123456789' as const;
    const characters = 'abcdefghijklmnñopqrstuvwxyzáéíóúABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ' as const;

    function resizeIf(list: Token[], token: Token, type: TokenType, char: string, pos: TokenPosition): Token {
        if (token.type === TokenType.eof)
            token.type = type;

        if (type === TokenType.operator && char === '-' && token.type === TokenType.identifier) { }
        else if (token.type === TokenType.separator || token.type !== type) {
            list.push(token);
            return { text: '', pos: { ...pos }, type: type };
        } else if (token.type === type) { }

        return token;
    }

    function charToType(char: string, props: IProps): TokenType {
        let type = TokenType.unknown;
        
        switch (true) {
            case numbers.includes(char): return TokenType.number;
            case (props.separators || separators).includes(char): return TokenType.separator;
            case (props.operators || operators).includes(char): return TokenType.operator;
            case characters.includes(char): return TokenType.identifier;
            case (props.spaces || spaces).includes(char):
                if (char === '\n')
                    return TokenType.eol;
                else
                    return TokenType.space;
        }

        return type;
    }

    interface IProps {
        spaces?: string
        operators?: string
        separators?: string
    }

    export function tokenizate(source: string, props: IProps = {spaces, operators, separators}): Token[] {
        let token: Token = { text: '', pos: { x: 1, y: 1 }, type: TokenType.eof };
        let result: Token[] = [];
        let pos: TokenPosition = { x: 1, y: 1 };
        let isString = false;
        let type = TokenType.unknown;

        for (let i = 0; i < source.length; i++) {
            let char = source[i];

            switch (true) {
                case char === '"':
                    if (isString = !isString)
                        token = resizeIf(result, token, TokenType.string, char, pos);

                    break;
                case isString:
                    break;
                case (type = charToType(char, props)) > TokenType.unknown:
                    // The next line is due to a TypeScript bug
                    // @ts-ignore
                    if (type === TokenType.eol)
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

        if(result.at(-1).type !== TokenType.eof)
            result.push({text: '', type: TokenType.eof, pos: {x: 0,y: 0}});

        return result;
    }


}

// console.log(TinyML.Tokenizer.tokenizate(`w-      "- q
// d"{wq} 
// wd`));