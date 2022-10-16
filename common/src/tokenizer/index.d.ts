export declare const enum TokenType {
    unknown = 0,
    space = 1,
    string = 2,
    identifier = 3,
    instruction = 4,
    number = 5,
    operator = 6,
    separator = 7,
    eol = 8,
    eof = 9
}
export declare type TokenPosition = {
    x: number;
    y: number;
};
export interface Token {
    text: string;
    pos: TokenPosition;
    type: TokenType;
}
export declare namespace Tokenizer {
    interface IProps {
        spaces?: string;
        operators?: string;
        separators?: string;
    }
    export function tokenizate(source: string, props?: IProps): Token[];
    export {};
}
