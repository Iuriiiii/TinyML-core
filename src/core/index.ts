import { Tokenizer } from '../tokenizer';

namespace Core {

    export interface IElement {
        tag: Tokenizer.Token | undefined,
        params: IElementParameters | undefined,
        content: (Tokenizer.Token[] | Element)[] | undefined,
        parent: Element | undefined;
    }

    export interface IParameter {
        name: Tokenizer.Token,
        value: Tokenizer.Token | boolean
    }

    export interface IElementParameters {
        content: Tokenizer.Token[],
        values: IParameter[]
    }

    type TContent = (Tokenizer.Token[] | Element)[];

    export class Element implements IElement {
        parent: Element | undefined;
        tag: Tokenizer.Token | undefined;
        params: IElementParameters | undefined;
        content: TContent = [];

        constructor(parent?: Element) {
            this.parent = parent;
        }

        toParamContent(token: Tokenizer.Token): void {
            this.params.content.push(token);
        }

        declareParam(token: Tokenizer.Token): void {
            this.params.values.push({ name: token, value: true });
        }

        updateLastParam(value: Tokenizer.Token): void {
            // this.params.values.at(-1).value = value.text;
        }

        getLastContentElement(): Tokenizer.Token[] | Element | undefined {
            return this.content.at(-1);
        }

        toContent(token: Element): void;
        toContent(token: Tokenizer.Token): void;
        toContent(token: any): void {
            let element = this.getLastContentElement();

            if (token instanceof Element)
                this.content.push(token);
            else if (element instanceof Element || element === undefined)
                this.content.push([token]);
            else
                element.push(token);

            // console.log('this.content:', this.content, 'element:', element);
        }

        initializeContent() {
            this.content = this.content || [];
        }

        canHasTag(): boolean {
            let element = this.getLastContentElement();
            // console.log(element);

            if (element instanceof Element || element === undefined)
                return false;

            let lastToken = getLastIdentifierToken(element);

            if (lastToken === undefined)
                return false;

            this.tag = element.splice(lastToken, 1)[0];

            return true;
        }

        hasTag(): boolean {
            return this.tag !== undefined;
        }
    }

    function getLastIdentifierToken(tokens: Tokenizer.Token[]): number | undefined {
        let i = tokens.length;

        while (i-- && tokens[i].type === Tokenizer.TokenType.space);

        if (tokens[i].type !== Tokenizer.TokenType.identifier)
            return;

        return i;
    }

    export class Compilation {
        content: TContent;
        isSuccess: boolean;
        description: string;
        errorPosition: Tokenizer.TokenPosition | undefined;

        constructor(success: boolean, description: string, position?: Tokenizer.TokenPosition) {
            this.isSuccess = success;

            if (position && (description.endsWith('at') || description.endsWith('since')))
                description += ` ${position.y}:${position.x}`;

            this.description = description;
            this.errorPosition = position;
        }

        setContent(content: TContent): Compilation {
            this.content = content;
            return this;
        }

        toString(): string {
            return JSON.stringify(this, undefined, '  ');
        }
    }

    export function compile(source: string): Compilation {
        if (source.length === 0)
            return new Compilation(true, 'Source empty');

        let tokens = Tokenizer.tokenizate(source, { separators: '[]{}()=;:', operators: '' }), token: Tokenizer.Token;
        let x = 0, y = 0, bra: Tokenizer.Token[] = [], cor: Tokenizer.Token[] = [], par: Tokenizer.Token[] = [];
        let element = new Element();
        let waitingValue = false;

        if (tokens[0].type === Tokenizer.TokenType.eof)
            return new Compilation(true, 'Source empty');

        f1: for (let i = 0; i < tokens.length; i++) {
            token = tokens[i];

            switch (true) {
                case token.type === Tokenizer.TokenType.eof:
                    break f1;
                case token.type === Tokenizer.TokenType.separator:
                    switch (token.text) {
                        case '{':
                            bra.push(token);
                            element.canHasTag();
                            element = new Element(element);

                            break;
                        case '(':
                            par.push(token);
                            element.params = { content: [], values: [] };

                            break;
                        case '[':
                            break;
                        case '}':
                            if (bra.length === 0)
                                return new Compilation(false, 'Invalid separator "}" at', token.pos);

                            element.parent.toContent(element);
                            [element.parent, element] = [undefined, element.parent];
                            bra.pop();

                            break;
                        case ')':
                            if (par.length === 0)
                                return new Compilation(false, 'Invalid separator ")" at', token.pos);



                            par.pop();
                            break;
                        case ']':
                            break;
                    }

                    break;
                case par.length > 0:
                    if (!waitingValue)
                        if (token.type !== Tokenizer.TokenType.identifier)
                            return new Compilation(false, 'Invalid token type at', token.pos);
                        else
                            element.declareParam(token);
                    else
                        if (token.type !== Tokenizer.TokenType.string)
                            return new Compilation(false, 'Invalid token type at', token.pos);
                        else
                            element.updateLastParam(token);


                    break;
                default:
                    element.toContent(token);
            }
        }

        if (bra.length > 0)
            return new Compilation(false, 'Infinite code block detected since', bra.at(-1).pos);
        else if (par.length > 0)
            return new Compilation(false, 'Infinite parameters block detected since', par.at(-1).pos);
        else if (cor.length > 0)
            return new Compilation(false, 'Infinite comment since', bra.at(-1).pos);

        return (new Compilation(true, 'Source compiled succefully')).setContent(element.content);
    }

}

let source = ` a thisisaTag(){
    t html { q}
}
`;

let result = Core.compile(source).toString();


console.log(result);