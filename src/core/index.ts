import { Tokenizer } from '../tokenizer';

namespace Core {

    export interface IElement {
        tag: Tokenizer.Token | undefined,
        params: IElementParameters | undefined,
        content: (Tokenizer.Token[] | Element)[] | undefined,
        parent: Element | undefined;
    }

    export interface IParameter {
        [key: string]: string,
        name: string,
        value: string
    }

    export interface IElementParameters {
        content: Tokenizer.Token[],
        values: IParameter[]
    }


    export class Element implements IElement {
        parent: Element | undefined;
        tag: Tokenizer.Token | undefined;
        params: IElementParameters | undefined;
        content: (Tokenizer.Token[] | Element)[] | undefined;

        constructor(parent?: Element) {
            this.parent = parent;
        }

        getLastContentElement(): Tokenizer.Token[] | Element | undefined {
            return this.content?.at(-1);
        }

        toContent(token: Element): unknown;
        toContent(token: Tokenizer.Token): unknown;
        toContent(token: any): unknown {
            let element = this.getLastContentElement();
            this.content = this.content || [];

            if (token instanceof Element)
                return this.content.push(token);

            if (element instanceof Element)
                this.content.push([token]);
            else
                (element as Tokenizer.Token[]).push(token);
        }

        initializeContent() {
            this.content = this.content || [];
        }

        toTag(tag: Tokenizer.Token | undefined): void {
            if (this.tag)
                this.toContent(this.tag);

            this.tag = tag;
        }

        hasTag(): boolean {
            return this.tag !== undefined;
        }
    }

    function geLastToken(tokens: Tokenizer.Token[], i: number): Tokenizer.Token {
        if (i === 0)
            return tokens[0];

        while (i-- && tokens[i].type === Tokenizer.TokenType.space);

        return tokens[i];
    }

    export class Compilation {
        elements: Element[] | undefined;
        isSuccess: boolean;
        description: string;
        errorPosition: Tokenizer.TokenPosition | undefined;

        constructor(success: boolean, description: string, position?: Tokenizer.TokenPosition) {
            this.isSuccess = success;

            if (position && description.endsWith('at'))
                description += ` ${position.y}:${position.x}`;

            this.description = description;
            this.errorPosition = position;
        }

        setElements(elements: Element[]): Compilation {
            this.elements = elements;
            return this;
        }
    }

    export function compile(source: string): Compilation {
        if (source.length === 0)
            return new Compilation(true, 'Source empty');

        let tokens = Tokenizer.tokenizate(source), token: Tokenizer.Token;
        let x = 0, y = 0, bra = 0, cor = 0, par = 0;
        let result: Element[] = [];
        let element = new Element();

        if (tokens[0].type === Tokenizer.TokenType.eof)
            return new Compilation(true, 'Source empty');

        for (let i = 0; i < tokens.length; i++) {
            token = tokens[i];

            switch (true) {
                case token.type === Tokenizer.TokenType.separator:
                    switch (token.text) {
                        case '{':
                            bra++;

                            if (element.hasTag())
                                element.initializeContent();

                            element = new Element(element);
                            break;
                        case '(':
                            break;
                        case '[':
                            break;
                        case '}':
                            if (--bra < 0)
                                return new Compilation(false, 'Invalid separator "}" at', token.pos);

                            element = element.parent!;
                            break;
                        case ')':
                            break;
                        case ']':
                            break;
                    }

                    element.toTag(undefined);
                    break;
                case cor > 0:

                    break;
                case token.type === Tokenizer.TokenType.identifier:
                    element.toTag(token);

                    break;
                default:
                    if (token.type !== Tokenizer.TokenType.space && token.type !== Tokenizer.TokenType.eol) { }
                    else
                        element.toTag(undefined);


            }
        }

        return (new Compilation(true, 'Source compiled succefully')).setElements(result);
    }

}

let source = `
html {
    head {
        title{This is a simple title}
    }
    This is the first raw content that you should be able to read without problem

    body {
        [This is a comment]
        main {
            {<h1>This is title</h1>}
        }
    }

    This is a raw content
}
`;

console.log('qwdqwd');