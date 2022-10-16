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
import { Tokenizer } from '../tokenizer';
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
export var Core;
(function (Core) {
    function tokensToString(tokens) {
        return tokens.map(token => token.text).join('');
    }
    class Elemental {
        tokens;
        isRaw;
        isElement;
        isComment;
        isCode;
        constructor(types, tokens) {
            this.tokens = tokens;
            this.isRaw = () => types.isRaw;
            this.isElement = () => types.isElement;
            this.isComment = () => types.isComment;
            this.isCode = () => types.isCode;
        }
        string;
        toString() {
            if (this.string === undefined)
                this.string = tokensToString(this.tokens);
            return this.string;
        }
        get() {
            /* @ts-ignore */
            return this;
        }
    }
    class Element extends Elemental {
        tag;
        params;
        children;
        constructor(tag, children, params) {
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
        paramsToString() {
            return tokensToString(this.params);
        }
    }
    Core.Element = Element;
    class Comment extends Elemental {
        constructor(tokens) {
            super({
                isCode: false,
                isComment: true,
                isElement: false,
                isRaw: false
            }, tokens);
        }
    }
    Core.Comment = Comment;
    class Raw extends Elemental {
        constructor(tokens) {
            super({
                isCode: false,
                isComment: false,
                isElement: false,
                isRaw: true
            }, tokens);
        }
    }
    Core.Raw = Raw;
    class Code extends Elemental {
        constructor(tokens) {
            super({
                isCode: true,
                isComment: false,
                isElement: false,
                isRaw: false
            }, tokens);
        }
    }
    Core.Code = Code;
    function parse(source) {
        const tokens = Tokenizer.tokenizate(source, {
            separators: '(){}[];:=,\\'
        });
        const tree = parseTokens(tokens);
        if (tree instanceof Error)
            throw tree;
        return tree;
    }
    Core.parse = parse;
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
    function error(description, token) {
        return new Error(description + ` at ${token.pos.y}:${token.pos.x}`);
    }
    function pushRawIfNeeded(stack, raws) {
        if (raws.length === 0)
            return false;
        stack.push(new Raw(raws));
        return true;
    }
    function stringHasInvalidFormat(tokens) {
        const last = tokens.at(-1);
        if (!last || last.type !== 2 /* TokenType.string */)
            return false;
        else if (last.text.length <= 1)
            return true;
        return last.text.startsWith('"') !== last.text.endsWith('"');
    }
    function tokenIsIdentifierOrInstruction(token) {
        return token && (token.type === 3 /* TokenType.identifier */ || token.type === 4 /* TokenType.instruction */);
    }
    function parseTokens(tokens, context = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 }) {
        if (tokens.length === 0)
            return [];
        // console.log(tokens);
        const result = [], start = context.i;
        let lastNonSpaceToken, lastNonSpaceTokenIndex = Number.MAX_SAFE_INTEGER, raws = [], params, comments, token;
        f1: for (; context.i < tokens.length; context.i++) {
            const i = context.i;
            token = tokens[context.i];
            if (token.type === 9 /* TokenType.eof */) {
                if (context.parentheses)
                    return error('Parenthese closure expected', token);
                if (context.brackets)
                    return error('Bracket closure expected', token);
                if (context.keys)
                    return error('Key closure expected', token);
                break;
            }
            if (token.type === 7 /* TokenType.separator */ && token.text === '}' && context.brackets === 0) {
                context.keys--;
                break;
            }
            /* This while just execute once, its needed to fasty code breaks */
            w1: while (context.pure === 0) {
                if (token.type === 7 /* TokenType.separator */) {
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
                            if (!(tokens[++context.i].type === 7 /* TokenType.separator */))
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
                            // console.log('>>>', raws, lastNonSpaceTokenIndex);
                            if (pushRawIfNeeded(result, raws))
                                raws = [];
                            const children = parseTokens(tokens, context);
                            if (context.pure > 0)
                                context.pure--;
                            if (children instanceof Error)
                                return children;
                            result.push(context.pure ? children[0] : new Element(lastNonSpaceToken, children, params));
                            continue f1;
                    }
                }
                break;
            }
            (context.brackets && comments ||
                context.parentheses && params ||
                raws).push(token);
            if ((context.parentheses + context.brackets) === 0 &&
                token.type !== 1 /* TokenType.space */ &&
                token.type !== 8 /* TokenType.eol */)
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
})(Core || (Core = {}));
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
//# sourceMappingURL=index.js.map