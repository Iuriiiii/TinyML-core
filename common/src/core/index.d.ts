import { Token } from '../tokenizer';
export declare namespace Core {
    interface IElement {
        tag: Token;
        params?: Token[];
        children?: Item[];
    }
    interface ITypes {
        isRaw: () => boolean;
        isElement: () => boolean;
        isComment: () => boolean;
        isCode: () => boolean;
    }
    type ITypesAsBoolean = {
        [Property in keyof ITypes]: boolean;
    };
    interface IElemental extends ITypes {
        tokens: Token[] | undefined;
        toString: () => string;
    }
    class Elemental implements IElemental {
        tokens: Token[] | undefined;
        isRaw: () => boolean;
        isElement: () => boolean;
        isComment: () => boolean;
        isCode: () => boolean;
        constructor(types: ITypesAsBoolean, tokens?: Token[]);
        string: string | undefined;
        toString(): string;
        get<T extends Element | Raw | Code | Comment>(): T;
    }
    export class Element extends Elemental implements IElement {
        tag: Token;
        params: Token[];
        children?: Item[];
        constructor(tag: Token, children?: Item[], params?: Token[]);
        paramsToString(): string;
    }
    export class Comment extends Elemental {
        constructor(tokens: Token[]);
    }
    export class Raw extends Elemental {
        constructor(tokens: Token[]);
    }
    export class Code extends Elemental {
        constructor(tokens: Token[]);
    }
    export function parse(source: string): Item[];
    export type Item = (Element | Comment | Raw | Code);
    export {};
}
