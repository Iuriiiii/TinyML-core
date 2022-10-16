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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Core = void 0;
var tokenizer_1 = require("../tokenizer");
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
var Core;
(function (Core) {
    function tokensToString(tokens) {
        return tokens.map(function (token) { return token.text; }).join('');
    }
    var Elemental = /** @class */ (function () {
        function Elemental(types, tokens) {
            this.tokens = tokens;
            this.isRaw = function () { return types.isRaw; };
            this.isElement = function () { return types.isElement; };
            this.isComment = function () { return types.isComment; };
            this.isCode = function () { return types.isCode; };
        }
        Elemental.prototype.toString = function () {
            if (this.string === undefined)
                this.string = tokensToString(this.tokens);
            return this.string;
        };
        Elemental.prototype.get = function () {
            /* @ts-ignore */
            return this;
        };
        return Elemental;
    }());
    var Element = /** @class */ (function (_super) {
        __extends(Element, _super);
        function Element(tag, children, params) {
            var _this = _super.call(this, {
                isCode: false,
                isComment: false,
                isElement: true,
                isRaw: false
            }) || this;
            _this.tag = tag;
            _this.children = children;
            _this.params = params;
            return _this;
        }
        Element.prototype.paramsToString = function () {
            return tokensToString(this.params);
        };
        return Element;
    }(Elemental));
    Core.Element = Element;
    var Comment = /** @class */ (function (_super) {
        __extends(Comment, _super);
        function Comment(tokens) {
            return _super.call(this, {
                isCode: false,
                isComment: true,
                isElement: false,
                isRaw: false
            }, tokens) || this;
        }
        return Comment;
    }(Elemental));
    Core.Comment = Comment;
    var Raw = /** @class */ (function (_super) {
        __extends(Raw, _super);
        function Raw(tokens) {
            return _super.call(this, {
                isCode: false,
                isComment: false,
                isElement: false,
                isRaw: true
            }, tokens) || this;
        }
        return Raw;
    }(Elemental));
    Core.Raw = Raw;
    var Code = /** @class */ (function (_super) {
        __extends(Code, _super);
        function Code(tokens) {
            return _super.call(this, {
                isCode: true,
                isComment: false,
                isElement: false,
                isRaw: false
            }, tokens) || this;
        }
        return Code;
    }(Elemental));
    Core.Code = Code;
    function parse(source) {
        var tokens = tokenizer_1.Tokenizer.tokenizate(source, {
            separators: '(){}[];:=,\\'
        });
        var tree = parseTokens(tokens);
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
        return new Error(description + " at ".concat(token.pos.y, ":").concat(token.pos.x));
    }
    function pushRawIfNeeded(stack, raws) {
        if (raws.length === 0)
            return false;
        stack.push(new Raw(raws));
        return true;
    }
    function stringHasInvalidFormat(tokens) {
        var last = tokens.at(-1);
        if (!last || last.type !== 2 /* TokenType.string */)
            return false;
        else if (last.text.length <= 1)
            return true;
        return last.text.startsWith('"') !== last.text.endsWith('"');
    }
    function tokenIsIdentifierOrInstruction(token) {
        return token && (token.type === 3 /* TokenType.identifier */ || token.type === 4 /* TokenType.instruction */);
    }
    function parseTokens(tokens, context) {
        if (context === void 0) { context = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 }; }
        if (tokens.length === 0)
            return [];
        // console.log(tokens);
        var result = [], start = context.i;
        var lastNonSpaceToken, lastNonSpaceTokenIndex = Number.MAX_SAFE_INTEGER, raws = [], params, comments, token;
        f1: for (; context.i < tokens.length; context.i++) {
            var i = context.i;
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
                    var isPure = !tokenIsIdentifierOrInstruction(lastNonSpaceToken);
                    switch (token.text) {
                        case ';':
                            if (context.brackets)
                                break;
                            var left = tokenIsIdentifierOrInstruction(tokens[i - 1]);
                            var right = tokenIsIdentifierOrInstruction(tokens[i + 1]);
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
                            var children = parseTokens(tokens, context);
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
            var lastItem = result.at(-1);
            if (lastItem.isRaw() && stringHasInvalidFormat(lastItem.tokens))
                return error('Infinite string detected', lastItem.tokens.at(-1));
            return result;
        }
    }
})(Core = exports.Core || (exports.Core = {}));
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
