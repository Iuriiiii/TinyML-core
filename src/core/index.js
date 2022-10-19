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
    function pushRawIfNeeded(stack, raws, asCode = false) {
        if (raws.length === 0)
            return false;
        stack.push(asCode ? new Code(raws) : new Raw(raws));
        return true;
    }
    function stringHasInvalidFormat(tokens) {
        const last = tokens.at(-1);
        if (!last || last.type !== 2 /* TokenType.STRING */)
            return false;
        else if (last.text.length <= 1)
            return true;
        return last.text.startsWith('"') !== last.text.endsWith('"');
    }
    function tokenIsIdentifierOrInstruction(token) {
        return token && (token.type === 3 /* TokenType.IDENTIFIER */ || token.type === 4 /* TokenType.INSTRUCTION */);
    }
    function parseTokens(tokens, context = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 }) {
        if (tokens.length === 0)
            return [];
        let lastNonSpaceToken, result = [], lastNonSpaceTokenIndex = Number.MAX_SAFE_INTEGER, raws = [], params, comments, token, wasPure = false;
        f1: for (; context.i < tokens.length; context.i++) {
            const i = context.i;
            token = tokens[context.i];
            if (token.type === 9 /* TokenType.EOF */) {
                if (context.parentheses)
                    return error('Parenthese closure expected', token);
                if (context.brackets)
                    return error('Bracket closure expected', token);
                if (context.keys || context.pure)
                    return error('Key closure expected', token);
                break;
            }
            d1: do {
                if (token.type === 7 /* TokenType.SEPARATOR */) {
                    if (context.brackets > 0 && !'[]'.includes(token.text) ||
                        context.pure > 0 && !'{}'.includes(token.text))
                        break d1;
                    const isPure = !tokenIsIdentifierOrInstruction(lastNonSpaceToken);
                    switch (token.text) {
                        case '}':
                            if (context.pure === 0)
                                context.keys--;
                            else {
                                if (--context.pure > 0) {
                                    break d1;
                                }
                                pushRawIfNeeded(result, raws, true);
                                raws = [];
                                continue f1;
                            }
                            break f1;
                        case ';':
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
                            if (!(tokens[++context.i].type === 7 /* TokenType.SEPARATOR */))
                                context.i--;
                            token = tokens[context.i];
                            break;
                        case '(':
                            if (context.parentheses > 0)
                                return error('Invalid token', token);
                            params = [];
                            /* Skips the first '[' */
                            if (context.parentheses++ === 0)
                                continue f1;
                            break;
                        case ')':
                            if (--context.parentheses < 0)
                                return error('Invalid token', token);
                            if (context.parentheses === 0)
                                continue f1;
                            break;
                        case '[':
                            if (context.parentheses > 0)
                                return error('Invalid token', token);
                            comments = [];
                            /* Skips the first '[' */
                            if (context.brackets++ === 0)
                                continue f1;
                            break;
                        case ']':
                            if (--context.brackets < 0 || context.parentheses > 0)
                                return error('Invalid token', token);
                            /* Skip the last ']' */
                            if (context.brackets === 0) {
                                if (pushRawIfNeeded(result, raws))
                                    raws = [];
                                result.push(new Comment(comments));
                                continue f1;
                            }
                            break;
                        case '{':
                            if (context.parentheses > 0)
                                return error('Invalid token', token);
                            if (isPure) {
                                if (++context.pure === 1)
                                    continue f1;
                                break d1;
                            }
                            else
                                context.keys++, raws = raws.slice(0, lastNonSpaceTokenIndex);
                            context.i++;
                            if (pushRawIfNeeded(result, raws))
                                raws = [];
                            const children = parseTokens(tokens, context);
                            if (children instanceof Error)
                                return children;
                            result.push(new Element(lastNonSpaceToken, children, params));
                            continue f1;
                    }
                }
            } while (false);
            (context.pure && raws ||
                context.brackets && comments ||
                context.parentheses && params ||
                raws).push(token);
            if ((context.parentheses + context.brackets + context.pure) === 0 &&
                token.type !== 1 /* TokenType.SPACE */ &&
                token.type !== 8 /* TokenType.EOL */)
                lastNonSpaceToken = token, lastNonSpaceTokenIndex = raws.length - 1;
        }
        if (context.keys < 0)
            return error('Invalid token', token);
        pushRawIfNeeded(result, raws);
        if (result.length > 0) {
            const lastItem = result.at(-1);
            if (lastItem.isRaw() && stringHasInvalidFormat(lastItem.tokens))
                return error('Infinite string detected', lastItem.tokens.at(-1));
            return result;
        }
    }
})(Core || (Core = {}));
//# sourceMappingURL=index.js.map