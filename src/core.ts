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

import { type IToken, Tokenizer, TokenType } from "./tokenizer.ts";

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
  /**
   * Represents a core element in the TinyML structure.
   */
  interface IElement {
    /**
     * The token identifying the tag.
     */
    tag: IToken;

    /**
     * The parameters associated with the element.
     */
    params?: IToken[];

    /**
     * The child items of the element.
     */
    children?: Item[];
  }

  /**
   * Converts a list of tokens to its string representation.
   */
  function tokensToString(tokens: IToken[] | undefined): string {
    if (!tokens) {
      return "";
    }

    const text = tokens.map((token) => {
      return token.text;
    }).join("");

    return text;
  }

  /**
   * Type flags for elemental objects.
   */
  interface ITypes {
    /**
     * Checks if the element is raw text.
     */
    isRaw(): boolean;

    /**
     * Checks if the element is a structured element.
     */
    isElement(): boolean;

    /**
     * Checks if the element is a comment.
     */
    isComment(): boolean;

    /**
     * Checks if the element is code.
     */
    isCode(): boolean;
  }

  /**
   * Boolean representation of the types flags.
   */
  type ITypesAsBoolean = {
    [Property in keyof ITypes]: boolean;
  };

  /**
   * Represents an object that can be converted to string and has type flags.
   */
  interface IElemental extends ITypes {
    /**
     * The tokens that compose the elemental.
     */
    tokens: IToken[] | undefined;

    /**
     * Converts the elemental to string.
     */
    toString(): string;
  }

  class Elemental implements IElemental {
    /**
     * The tokens that compose the elemental.
     */
    tokens: IToken[] | undefined;

    /**
     * Internal string cache.
     */
    private string: string | undefined;

    /**
     * Internal flags for types.
     */
    private types: ITypesAsBoolean;

    constructor(types: ITypesAsBoolean, tokens?: IToken[]) {
      this.tokens = tokens;
      this.types = types;
    }

    /**
     * Checks if the element is raw text.
     */
    isRaw(): boolean {
      return this.types.isRaw;
    }

    /**
     * Checks if the element is a structured element.
     */
    isElement(): boolean {
      return this.types.isElement;
    }

    /**
     * Checks if the element is a comment.
     */
    isComment(): boolean {
      return this.types.isComment;
    }

    /**
     * Checks if the element is code.
     */
    isCode(): boolean {
      return this.types.isCode;
    }

    /**
     * Converts the elemental to string.
     */
    toString(): string {
      const isCached = this.string !== undefined;

      if (!isCached) {
        this.string = tokensToString(this.tokens);
      }

      return this.string as string;
    }

    /**
     * Returns the elemental casted to a specific type.
     */
    get<T extends Element | Raw | Code | Comment>(): T {
      // @ts-ignore: [BY-AI] Casting 'this' to T is safe here as it's intended to be used with the correct type check before.
      return this as T;
    }
  }

  /**
   * Represents a structured element.
   */
  export class Element extends Elemental implements IElement {
    /**
     * The token identifying the tag.
     */
    tag: IToken;

    /**
     * The parameters associated with the element.
     */
    params: IToken[];

    /**
     * The child items of the element.
     */
    children?: Item[];

    constructor(tag: IToken, children?: Item[], params: IToken[] = []) {
      super({
        isCode: false,
        isComment: false,
        isElement: true,
        isRaw: false,
      });

      this.tag = tag;
      this.children = children;
      this.params = params;
    }

    /**
     * Converts the parameters to string.
     */
    paramsToString(): string {
      const text = tokensToString(this.params);

      return text;
    }
  }

  /**
   * Represents a comment block.
   */
  export class Comment extends Elemental {
    constructor(tokens: IToken[]) {
      super({
        isCode: false,
        isComment: true,
        isElement: false,
        isRaw: false,
      }, tokens);
    }
  }

  /**
   * Represents raw text.
   */
  export class Raw extends Elemental {
    constructor(tokens: IToken[]) {
      super({
        isCode: false,
        isComment: false,
        isElement: false,
        isRaw: true,
      }, tokens);
    }
  }

  /**
   * Represents a code block.
   */
  export class Code extends Elemental {
    constructor(tokens: IToken[]) {
      super({
        isCode: true,
        isComment: false,
        isElement: false,
        isRaw: false,
      }, tokens);
    }
  }

  /**
   * Parses the source code into a tree of items.
   */
  export function parse(source: string) {
    const tokens = Tokenizer.tokenizate(source, {
      separators: "(){}[];:=,\\<>",
    });

    const tree = parseTokens(tokens);
    const isError = tree instanceof Error;

    if (isError) {
      throw tree;
    }

    const result = tree || [];

    return result;
  }

  /**
   * Creates a descriptive error.
   */
  function error(description: string, token: IToken): Error {
    const message = `${description} at ${token.pos.y}:${token.pos.x}`;
    const errorInstance = new Error(message);

    return errorInstance;
  }

  /**
   * Represents a possible item in the tree.
   */
  export type Item = Element | Comment | Raw | Code;

  /**
   * Parsing context to track nesting.
   */
  interface IContext {
    /**
     * Current token index.
     */
    i: number;

    /**
     * Parentheses nesting level.
     */
    parentheses: number;

    /**
     * Keys nesting level.
     */
    keys: number;

    /**
     * Brackets nesting level.
     */
    brackets: number;

    /**
     * Pure block nesting level.
     */
    pure: number;
  }

  /**
   * Pushes a raw or code item to the stack if there are tokens.
   */
  function pushRawIfNeeded(
    stack: Item[],
    raws: IToken[],
    asCode: boolean = false,
  ): boolean {
    const isRawsEmpty = raws.length === 0;

    if (isRawsEmpty) {
      return false;
    }

    const item = asCode ? new Code(raws) : new Raw(raws);
    stack.push(item);

    return true;
  }

  /**
   * Checks if a string has an invalid format (e.g., missing closing quote).
   */
  function stringHasInvalidFormat(tokens: IToken[]): boolean {
    const lastToken = tokens.at(-1);
    const isLastTokenString = lastToken && lastToken.type === TokenType.STRING;

    if (!isLastTokenString) {
      return false;
    }

    const lastTokenText = lastToken.text;
    const isStringTooShort = lastTokenText.length <= 1;

    if (isStringTooShort) {
      return true;
    }

    const hasStartingQuote = lastTokenText.startsWith('"');
    const hasEndingQuote = lastTokenText.endsWith('"');
    const isFormatInvalid = hasStartingQuote !== hasEndingQuote;

    return isFormatInvalid;
  }

  /**
   * Checks if a token is an identifier or an instruction.
   */
  function tokenIsIdentifierOrInstruction(token?: IToken): boolean {
    const isIdentifier = token && token.type === TokenType.IDENTIFIER;
    const isInstruction = token && token.type === TokenType.INSTRUCTION;
    const isIdentifierOrInstruction = isIdentifier || isInstruction;

    return !!isIdentifierOrInstruction;
  }

  /**
   * Recursively parses tokens into items.
   */
  function parseTokens(
    tokens: IToken[],
    context: IContext = { i: 0, parentheses: 0, keys: 0, brackets: 0, pure: 0 },
  ): Item[] | Error | undefined {
    const isTokensEmpty = tokens.length === 0;

    if (isTokensEmpty) {
      return [];
    }

    let lastNonSpaceToken: IToken | undefined;
    const result: Item[] = [];
    let lastNonSpaceTokenIndex = Number.MAX_SAFE_INTEGER;
    let raws: IToken[] = [];
    let params: IToken[] = [];
    let comments: IToken[] = [];
    let token: IToken | undefined;

    f1:
    for (; context.i < tokens.length; context.i++) {
      const i = context.i;
      token = tokens[context.i];

      const isEof = token.type === TokenType.EOF;

      if (isEof) {
        const hasOpenParentheses = context.parentheses > 0;
        const hasOpenBrackets = context.brackets > 0;
        const hasOpenKeys = context.keys > 0;
        const hasOpenPure = context.pure > 0;

        if (hasOpenParentheses) {
          return error("Parenthese closure expected", token);
        }

        if (hasOpenBrackets) {
          return error("Bracket closure expected", token);
        }

        const isUnclosed = hasOpenKeys || hasOpenPure;

        if (isUnclosed) {
          return error("Key closure expected", token);
        }

        break f1;
      }

      d1:
      do {
        const isSeparator = token.type === TokenType.SEPARATOR;

        if (isSeparator) {
          const isInvalidBracketContext = context.brackets > 0 &&
            !"[]".includes(token.text);
          const isInvalidPureContext = context.pure > 0 &&
            !"{}".includes(token.text);
          const isInvalidContext = isInvalidBracketContext ||
            isInvalidPureContext;

          if (isInvalidContext) {
            break d1;
          }

          const isPure = !tokenIsIdentifierOrInstruction(lastNonSpaceToken);

          switch (token.text) {
            case "}": {
              const isInPureBlock = context.pure > 0;

              if (isInPureBlock) {
                if (--context.pure > 0) {
                  break d1;
                }

                if (pushRawIfNeeded(result, raws, true)) {
                  raws = [];
                }

                continue f1;
              }

              context.keys--;

              break f1;
            }

            case ";": {
              const previousToken = tokens[i - 1];
              const nextToken = tokens[i + 1];
              const isLeftIdentifier = tokenIsIdentifierOrInstruction(
                previousToken,
              );
              const isRightIdentifier = tokenIsIdentifierOrInstruction(
                nextToken,
              );

              if (pushRawIfNeeded(result, raws)) {
                raws = [];
              }

              const isIdentifierContext = !isPure && !isRightIdentifier;

              switch (true) {
                case isLeftIdentifier && isRightIdentifier:
                  break;

                case isIdentifierContext:
                  if (lastNonSpaceToken) {
                    const lastItem = result.pop();

                    if (lastItem) {
                      const slicedTokens = lastItem.tokens!.slice(
                        0,
                        lastNonSpaceTokenIndex,
                      );
                      pushRawIfNeeded(result, slicedTokens);
                    }

                    const element = new Element(
                      lastNonSpaceToken,
                      undefined,
                      params,
                    );
                    result.push(element);
                  }
                  break;

                case !isLeftIdentifier && isRightIdentifier:
                  break;
              }

              continue f1;
            }

            case "\\": {
              const nextIndex = ++context.i;
              const nextToken = tokens[nextIndex];
              const isNextSeparator = nextToken.type === TokenType.SEPARATOR;

              if (!isNextSeparator) {
                context.i--;
              }

              token = tokens[context.i];
              break;
            }

            case "(": {
              const hasOpenParentheses = context.parentheses > 0;

              if (hasOpenParentheses) {
                return error("Invalid token", token);
              }

              params = [];

              if (context.parentheses++ === 0) {
                continue f1;
              }

              break;
            }

            case ")": {
              if (--context.parentheses < 0) {
                return error("Invalid token", token);
              }

              const isParenthesesClosed = context.parentheses === 0;

              if (isParenthesesClosed) {
                continue f1;
              }

              break;
            }

            case "[": {
              const hasOpenParentheses = context.parentheses > 0;

              if (hasOpenParentheses) {
                return error("Invalid token", token);
              }

              comments = [];

              if (context.brackets++ === 0) {
                continue f1;
              }

              break;
            }

            case "]": {
              const isInvalidBrackets = --context.brackets < 0;
              const hasOpenParentheses = context.parentheses > 0;
              const isInvalid = isInvalidBrackets || hasOpenParentheses;

              if (isInvalid) {
                return error("Invalid token", token);
              }

              const isBracketsClosed = context.brackets === 0;

              if (isBracketsClosed) {
                if (pushRawIfNeeded(result, raws)) {
                  raws = [];
                }

                const comment = new Comment(comments);
                result.push(comment);

                continue f1;
              }

              break;
            }

            case "{": {
              const hasOpenParentheses = context.parentheses > 0;

              if (hasOpenParentheses) {
                return error("Invalid token", token);
              }

              if (isPure) {
                if (++context.pure === 1) {
                  continue f1;
                }

                break d1;
              }

              context.keys++;
              raws = raws.slice(0, lastNonSpaceTokenIndex);

              context.i++;

              if (pushRawIfNeeded(result, raws)) {
                raws = [];
              }

              const children = parseTokens(tokens, context);
              const isChildrenError = children instanceof Error;

              if (isChildrenError) {
                return children;
              }

              if (lastNonSpaceToken) {
                const element = new Element(
                  lastNonSpaceToken,
                  children,
                  params,
                );
                result.push(element);
              }

              continue f1;
            }
          }
        }
      } while (false);

      const stack = (() => {
        const isPureBlock = context.pure > 0;

        if (isPureBlock) {
          return raws;
        }

        const isBracketBlock = context.brackets > 0;

        if (isBracketBlock) {
          return comments;
        }

        const isParenthesesBlock = context.parentheses > 0;

        if (isParenthesesBlock) {
          return params;
        }

        return raws;
      })();

      stack.push(token);

      const isOutsideNesting =
        (context.parentheses + context.brackets + context.pure) === 0;
      const isNotSpace = token.type !== TokenType.SPACE;
      const isNotEol = token.type !== TokenType.EOL;
      const isLastNonSpaceTokenCandidate = isOutsideNesting && isNotSpace &&
        isNotEol;

      if (isLastNonSpaceTokenCandidate) {
        lastNonSpaceToken = token;
        lastNonSpaceTokenIndex = raws.length - 1;
      }
    }

    const isKeysInvalid = context.keys < 0;

    if (isKeysInvalid) {
      if (token) {
        return error("Invalid token", token);
      }

      const invalidTokenError = new Error("Invalid token");

      return invalidTokenError;
    }

    pushRawIfNeeded(result, raws);

    const hasResults = result.length > 0;

    if (hasResults) {
      const lastItem = result.at(-1);
      const isLastRaw = lastItem && lastItem.isRaw();

      if (isLastRaw) {
        const lastItemTokens = lastItem.tokens || [];
        const isFormatInvalid = stringHasInvalidFormat(lastItemTokens);

        if (isFormatInvalid) {
          const lastToken = lastItemTokens.at(-1);

          if (lastToken) {
            return error("Infinite string detected", lastToken);
          }

          const infiniteStringError = new Error("Infinite string detected");

          return infiniteStringError;
        }
      }

      return result;
    }

    return undefined;
  }
}
