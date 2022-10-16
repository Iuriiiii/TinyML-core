"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const tokenizer_1 = require("../tokenizer");
var Core;
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
        const tokens = tokenizer_1.Tokenizer.tokenizate(source, {
            separators: '(){}[];:=,\\'
        });
        const tree = parseTokens(tokens);
        if (tree instanceof Error)
            throw tree;
        return tree;
    }
    Core.parse = parse;
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
        if (!last || last.type !== 2)
            return false;
        else if (last.text.length <= 1)
            return true;
        return last.text.startsWith('"') !== last.text.endsWith('"');
    }
    function tokenIsIdentifierOrInstruction(token) {
        return token && (token.type === 3 || token.type === 4);
    }
    function parseTokens(tokens, context = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 }) {
        if (tokens.length === 0)
            return [];
        const result = [], start = context.i;
        let lastNonSpaceToken, lastNonSpaceTokenIndex = Number.MAX_SAFE_INTEGER, raws = [], params, comments, token;
        f1: for (; context.i < tokens.length; context.i++) {
            const i = context.i;
            token = tokens[context.i];
            if (token.type === 9) {
                if (context.parentheses)
                    return error('Parenthese closure expected', token);
                if (context.brackets)
                    return error('Bracket closure expected', token);
                if (context.keys)
                    return error('Key closure expected', token);
                break;
            }
            if (token.type === 7 && token.text === '}' && context.brackets === 0) {
                context.keys--;
                break;
            }
            w1: while (context.pure === 0) {
                if (token.type === 7) {
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
                                case left && right:
                                    break;
                                case !isPure && !right:
                                    pushRawIfNeeded(result, result.pop().tokens.slice(1, lastNonSpaceTokenIndex));
                                    result.push(new Element(lastNonSpaceToken, undefined, params));
                                    break;
                                case !left && right:
                                    break;
                            }
                            continue f1;
                        case '\\':
                            if (context.brackets)
                                break;
                            if (!(tokens[++context.i].type === 7))
                                context.i--;
                            token = tokens[context.i];
                            break;
                        case '(':
                            if (context.brackets)
                                break;
                            if (context.parentheses)
                                return error('Invalid token', token);
                            params = [];
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
                            if (context.brackets++ === 0)
                                continue f1;
                            break;
                        case ']':
                            if (--context.brackets < 0 || context.parentheses)
                                return error('Invalid token', token);
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
                                raws = raws.slice(1, lastNonSpaceTokenIndex);
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
            if ((context.parentheses + context.brackets) === 0 &&
                token.type !== 1 &&
                token.type !== 8)
                lastNonSpaceToken = token, lastNonSpaceTokenIndex = context.i - start;
            (context.brackets && comments ||
                context.parentheses && params ||
                raws).push(token);
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
})(Core = exports.Core || (exports.Core = {}));
//# sourceMappingURL=index.js.map