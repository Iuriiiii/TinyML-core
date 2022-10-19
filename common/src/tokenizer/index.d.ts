export declare const enum TokenType {
    UNKNOWN = 0,
    SPACE = 1,
    STRING = 2,
    IDENTIFIER = 3,
    INSTRUCTION = 4,
    NUMBER = 5,
    OPERATOR = 6,
    SEPARATOR = 7,
    EOL = 8,
    EOF = 9
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
