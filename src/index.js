var Core;
(function (Core) {
    var Element = /** @class */ (function () {
        function Element(parent) {
            this.content = [];
            this.parent = parent;
        }
        Element.prototype.toParam = function (token) {
            this.params = this.params || { content: [], values: [] };
            this.params.content.push(token);
        };
        Element.prototype.getLastContentElement = function () {
            return this.content.at(-1);
        };
        Element.prototype.toContent = function (token) {
            var element = this.getLastContentElement();
            if (token instanceof Element)
                this.content.push(token);
            else if (element instanceof Element || element === undefined)
                this.content.push([token]);
            else
                element.push(token);
            // console.log('this.content:', this.content, 'element:', element);
        };
        Element.prototype.initializeContent = function () {
            this.content = this.content || [];
        };
        Element.prototype.canHasTag = function () {
            var element = this.getLastContentElement();
            // console.log(element);
            if (element instanceof Element || element === undefined)
                return false;
            var lastToken = getLastIdentifierToken(element);
            if (lastToken === undefined)
                return false;
            this.tag = element.splice(lastToken, 1)[0];
            return true;
        };
        Element.prototype.hasTag = function () {
            return this.tag !== undefined;
        };
        return Element;
    }());
    Core.Element = Element;
    function getLastIdentifierToken(tokens) {
        var i = tokens.length;
        while (i-- && tokens[i].type === Tokenizer.TokenType.space)
            ;
        if (tokens[i].type !== Tokenizer.TokenType.identifier)
            return;
        return i;
    }
    var Compilation = /** @class */ (function () {
        function Compilation(success, description, position) {
            this.isSuccess = success;
            if (position && (description.endsWith('at') || description.endsWith('since')))
                description += " ".concat(position.y, ":").concat(position.x);
            this.description = description;
            this.errorPosition = position;
        }
        Compilation.prototype.setContent = function (content) {
            this.content = content;
            return this;
        };
        Compilation.prototype.toString = function () {
            return JSON.stringify(this, undefined, '  ');
        };
        return Compilation;
    }());
    Core.Compilation = Compilation;
    function compile(source) {
        var _a;
        if (source.length === 0)
            return new Compilation(true, 'Source empty');
        var tokens = Tokenizer.tokenizate(source), token;
        var x = 0, y = 0, bra = [], cor = [], par = [];
        var element = new Element();
        if (tokens[0].type === Tokenizer.TokenType.eof)
            return new Compilation(true, 'Source empty');
        f1: for (var i = 0; i < tokens.length; i++) {
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
                            break;
                        case '[':
                            break;
                        case '}':
                            if (bra.length === 0)
                                return new Compilation(false, 'Invalid separator "}" at', token.pos);
                            element.parent.toContent(element);
                            _a = [undefined, element.parent], element.parent = _a[0], element = _a[1];
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
                case cor.length > 0:
                    break;
                // case token.type === Tokenizer.TokenType.identifier:
                //     element.toTag(token);
                //     break;
                default:
                    if (par.length)
                        ;
                    else
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
    Core.compile = compile;
})(Core || (Core = {}));
var source = " a thisisaTag {\n    t html { q}\n}\n";
var result = Core.compile(source).toString();
console.log(result);
