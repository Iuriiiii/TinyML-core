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

import { Tokenizer, TokenType, Token, TokenPosition } from '../tokenizer';

/*
    a (); [ No tag ]
    a(); [tag]

    tag {} [No tag]
*/


/*

html {
    body {
        [This is a line of code]
        { any code that i want <> </> }
    }
}

*/

export namespace Core {
    interface IElement {
        tag: Token,
        params?: Token[]
        children?: Item[]
    }

    function tokensToString(tokens: Token[]): string {
        return tokens.map(token => token.text).join('');
    }

    interface ITypes {
        isRaw: () => boolean,
        isElement: () => boolean,
        isComment: () => boolean,
        isCode: () => boolean
    }

    type ITypesAsBoolean = {
        [Property in keyof ITypes]: boolean
    }
    interface IElemental extends ITypes {
        tokens: Token[] | undefined,
        toString: () => string
    }

    class Elemental implements IElemental {
        tokens: Token[] | undefined;
        isRaw: () => boolean;
        isElement: () => boolean;
        isComment: () => boolean;
        isCode: () => boolean;

        constructor(types: ITypesAsBoolean, tokens?: Token[]) {
            this.tokens = tokens;
            this.isRaw = () => types.isRaw;
            this.isElement = () => types.isElement;
            this.isComment = () => types.isComment;
            this.isCode = () => types.isCode;
        }

        string: string | undefined;

        toString(): string {
            if (this.string === undefined)
                this.string = tokensToString(this.tokens);

            return this.string;
        }

        get<T extends Element | Raw | Code | Comment>(): T {
            /* @ts-ignore */
            return this as T;
        }
    }

    export class Element extends Elemental implements IElement {
        tag: Token;
        params: Token[];
        children?: Item[];

        constructor(tag: Token, children?: Item[], params?: Token[]) {
            super({
                isCode: false,
                isComment: false,
                isElement: true,
                isRaw: false
            });
            this.tag = tag;
            this.children = children;
            this.params = params;
        }

        paramsToString(): string {
            return tokensToString(this.params);
        }
    }

    export class Comment extends Elemental {

        constructor(tokens: Token[]) {
            super({
                isCode: false,
                isComment: true,
                isElement: false,
                isRaw: false
            }, tokens);
        }
    }

    export class Raw extends Elemental {
        constructor(tokens: Token[]) {
            super({
                isCode: false,
                isComment: false,
                isElement: false,
                isRaw: true
            }, tokens);
        }
    }

    export class Code extends Elemental {
        constructor(tokens: Token[]) {
            super({
                isCode: true,
                isComment: false,
                isElement: false,
                isRaw: false
            }, tokens);
        }
    }

    export function parse(source: string) {
        const tokens = Tokenizer.tokenizate(source, {
            separators: '(){}[];:=,\\'
        });

        const tree = parseTokens(tokens);

        if (tree instanceof Error)
            throw tree;

        return tree;
    }

    // function getLastToken(tokens: Token[]): Token | undefined {
    //     if (tokens.length === 0)
    //         return;

    //     const nonSpaceTokens = tokens.filter((token) =>
    //         token.type !== TokenType.space &&
    //         token.type !== TokenType.eol &&
    //         token.type !== TokenType.eof
    //     );

    //     if (nonSpaceTokens.length === 0)
    //         return;

    //     return nonSpaceTokens.at(-1);
    // }

    function error(description: string, token: Token): Error {
        return new Error(description + ` at ${token.pos.y}:${token.pos.x}`)
    }

    export type Item = (Element | Comment | Raw | Code);

    interface IContext {
        i: number,
        parentheses: number,
        keys: number,
        brackets: number,
        pure: number
    }

    function pushRawIfNeeded(stack: Item[], raws: Token[]): boolean {
        if (raws.length === 0)
            return false;

        stack.push(new Raw(raws));

        return true;
    }

    function stringHasInvalidFormat(tokens: Token[]): boolean {
        const last = tokens.at(-1);

        if (!last || last.type !== TokenType.string)
            return false;
        else if (last.text.length <= 1)
            return true;


        return last.text.startsWith('"') !== last.text.endsWith('"');
    }

    function tokenIsIdentifierOrInstruction(token?: Token) {
        return token && (token.type === TokenType.identifier || token.type === TokenType.instruction);
    }

    function parseTokens(tokens: Token[], context: IContext = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 }): Item[] | Error {
        if (tokens.length === 0)
            return [];

        // console.log(tokens);

        const result: Item[] = [], start: number = context.i;
        let lastNonSpaceToken: Token | undefined,
            lastNonSpaceTokenIndex: number = Number.MAX_SAFE_INTEGER,
            raws: Token[] = [],
            params: Token[] | undefined,
            comments: Token[] | undefined,
            token: Token;

        f1: for (; context.i < tokens.length; context.i++) {
            const i = context.i;
            token = tokens[context.i];

            if (token.type === TokenType.eof) {
                if (context.parentheses)
                    return error('Parenthese closure expected', token);

                if (context.brackets)
                    return error('Bracket closure expected', token);

                if (context.keys)
                    return error('Key closure expected', token);

                break;
            }

            if (token.type === TokenType.separator && token.text === '}' && context.brackets === 0) {
                context.keys--;
                break;
            }


            /* This while just execute once, its needed to fasty code breaks */
            w1: while (context.pure === 0) {
                if (token.type === TokenType.separator) {
                    const isPure = !tokenIsIdentifierOrInstruction(lastNonSpaceToken);

                    switch (token.text) {
                        case ';':
                            if (context.brackets)
                                break;

                            const left = tokenIsIdentifierOrInstruction(tokens[i - 1]);
                            const right = tokenIsIdentifierOrInstruction(tokens[i + 1]);

                            if (pushRawIfNeeded(result, raws))
                                raws = [];

                            switch (true) {
                                /* identifier1;identifier2 */
                                case left && right:
                                    break;
                                /* identifier[\s+]?; */
                                case !isPure && !right:
                                    pushRawIfNeeded(result, result.pop().tokens.slice(0, lastNonSpaceTokenIndex));
                                    result.push(new Element(lastNonSpaceToken, undefined, params));
                                    break;
                                /* ;identifier */
                                case !left && right:
                                    break;
                            }

                            continue f1;
                        case '\\':
                            if (context.brackets)
                                break;

                            if (!(tokens[++context.i].type === TokenType.separator))
                                context.i--;

                            token = tokens[context.i];
                            break;
                        case '(':
                            if (context.brackets)
                                break;

                            if (context.parentheses)
                                return error('Invalid token', token);

                            params = [];

                            /* Skips the first '[' */
                            if (context.parentheses++ === 0)
                                continue f1;

                            break;
                        case ')':
                            if (context.brackets)
                                break;

                            if (--context.parentheses < 0)
                                return error('Invalid token', token);

                            if (context.parentheses === 0)
                                continue f1;

                            break;
                        case '[':
                            if (context.parentheses)
                                return error('Invalid token', token);

                            comments = [];
                            /* Skips the first '[' */
                            if (context.brackets++ === 0)
                                continue f1;
                            // console.log('[');

                            break;
                        case ']':
                            if (--context.brackets < 0 || context.parentheses)
                                return error('Invalid token', token);

                            // console.log(context.brackets);

                            /* Skip the last ']' */
                            if (context.brackets === 0) {
                                if (pushRawIfNeeded(result, raws))
                                    raws = [];

                                result.push(new Comment(comments));
                                continue f1;
                            }

                            break;
                        case '{':
                            if (context.brackets > 0)
                                break;

                            if (context.parentheses)
                                return error('Invalid token', token);

                            context.i++;
                            context.keys++;

                            if (isPure)
                                context.pure++;
                            else
                                raws = raws.slice(0, lastNonSpaceTokenIndex);
                            console.log('>>>', raws, lastNonSpaceTokenIndex);
                            if (pushRawIfNeeded(result, raws))
                                raws = [];

                            const children = parseTokens(tokens, context);

                            if (context.pure > 0)
                                context.pure--;

                            if (children instanceof Error)
                                return children as Error;

                            result.push(context.pure ? children[0] : new Element(lastNonSpaceToken, children, params));

                            continue f1;
                    }

                }
                break;
            }

            (
                context.brackets && comments ||
                context.parentheses && params ||
                raws
            ).push(token);

            if (
                (context.parentheses + context.brackets) === 0 &&
                token.type !== TokenType.space &&
                token.type !== TokenType.eol
            )
                lastNonSpaceToken = token, lastNonSpaceTokenIndex = raws.length - 1;
        }

        if (context.keys < 0)
            return error('Invalid token', token);

        if (context.pure > 0) {
            return [new Code(raws)];
        }

        pushRawIfNeeded(result, raws);

        if (result.length > 0) {
            const lastItem = result.at(-1);
            if (lastItem.isRaw() && stringHasInvalidFormat(lastItem.tokens))
                return error('Infinite string detected', lastItem.tokens.at(-1));

            return result;
        }
    }
}

// let source = {
//     params: 'html(param1){}',
//     source1: ` a thisisaTag(){
//         t html { q}
//         THIs is a raw ctext
//     }
//     `,
//     source2: `

//             title { Hola Mundo }

//     `,
//     source3: `
//     [ This is a comment {} ]
// `,
//     source4: '\\{This is a raw content\\}',
//     source5: `
//     [ This is a comment {} ]
// `,
//     source6: `
// body {
//     header {
//         h1 { E-Commerce } div {

//         }
//     }
// }
// `
// };

// const tree = Core.parse(source.source6);

// console.log(JSON.stringify(tree, undefined, ' '));

/*
a <thisisaTag>
    t html { q}
</thisisaTag>
*/

// let result = Core.compile(source).toString();


// console.log(result);