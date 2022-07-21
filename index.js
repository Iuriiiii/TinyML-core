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
"use strict";

/* https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript */
function hashString(s)
{
    let hash = 0, i, chr;

    if (s.length === 0)
        return hash;

    for(let i = 0; i < s.length; i++) {
        chr   = s.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

const selfCloseTags = ['img', 'br', 'input', 'link', 'meta', 'area', 'source', 'base', 'col', 'option', 'embed', 'hr', 'param', 'track'];
const htmlTags = ['a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdo', 'blockquote', 'body', 'html', 'head', 'title', 'button', 'form', 'cite', 'code', 'colgroup', 'command', 'strong', 'u', 'datalist', 'dd', 'table', 'th', 'tr', 'td', 'thead', 'tfoot', 'tbody', 'var', 'p', 'wbr', 'sup', 'sub', 'style', 'span', 'small', 'select', 'option', 'script', 'section', 'main', 'header', 'footer', 'samp', 's', 'ruby', 'rt', 'rp', 'q', 'progress', 'pre', 'output', 'optgroup', 'ol', 'li', 'ul', 'noscript', 'object', 'nav', 'meter', 'fieldset', 'legend', 'kbd', 'ins', 'iframe', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption', 'em', 'dt', 'dl', 'div', 'details', 'dfn', 'del'];
const toParams = params => (params || '')  === '' ? '' : ` ${params}`;

function htmlCompilator(props)
{
    // console.log(this);
    if(this.type === 'raw')
        return this.content;

    let params = toParams(this.params);

    if(selfCloseTags.includes(this.tag))
        return `<${this.tag}${params}/>`;

    let content = this.childs.reduce((acc, val) =>
    {
        return acc += val.compile(props);
    }, '');

    return `<${this.tag}${params}>${content}</${this.tag}>`;
}

function compile(props, compilator = htmlCompilator)
{
    return compilator.call(this, props);
}

function extract(obj, expr, del = '>')
{
    if(typeof obj === 'function')
        obj = obj(expr);

    if(typeof expr !== 'string' || typeof del !== 'string' || typeof obj !== 'object')
        return undefined;
        
    return expr.split(del).reduce((acc, item) =>
    {
        if(typeof acc[item] === 'function')
            return acc[item]();
        else
            return acc[item];

    }, obj);
}

function isSpace(char)
{
    return ' \f\n\r\t\v'.includes(char);
}

export default class TinyMLCore
{
    static #cache = {};
     
    static #error(description, line, position)
    {
        return {
            success: false,
            description: `${description}${line}:${position}`,
            line: line,
            position: position
        };
    };
    
    static #success(source, contents, props, contexts, isFirst)
    {
        let res = [];
    
        if(contents.prev.trim() !== '')
            res.push({
                type: 'raw',
                content: contents.prev,
                compile: compile
            });
    
        if(contents.tag !== '')
        {
            let srcHash = hashString(source);
            let propValues = Object.values(contents.properties);
    
            res.push({
                type: 'tag',
                srcHash: srcHash,
                fullHash: srcHash + hashString(propValues.join('')),
                source: source,
                tag: contents.tag,
                params: contents.params,
                hasProps: propValues.length > 0,
                props: contents.properties,
                childs: TinyMLCore.#internalCompilator.call({context: contexts.code, first: true}, contents.code, props).content,
                compile: compile
            });
        }
    
        if(contents.last.trim() !== '')
            res.push(...TinyMLCore.#internalCompilator.call({context: contexts.last, first: true}, contents.last, props).content);
    
        if(isFirst)
            TinyMLCore.#cache[source] = res = {
                success: true,
                content: [...res],
                compile: function()
                {
                    return this.content.reduce((acc, child) => acc += child.compile(), '');
                }
            };
    
        return res;
    }

    /**
     * Parses the TinyML's source code and return an object from it.
     * 
     * @param {String} source 
     * @param {Object} properties 
     * @param {*} context INTERNAL USE
     * @param {*} first   INTERNAL USE
     * @returns {Object}
     * 
     * The return object will be contain a member called 'success' with the
     * status of the compilation, if the success its correct, a 'content'
     * member will be added to the return object and it will contain all
     * the tree data that you will need to create your own translations.
     * Otherwise, a 'description' member will get the description of the
     * error.
     * 
     * Example I:
     *  {success: true, content: [...]}
     * 
     * Example II:
     *  {success: false, description: 'error description'}
     * 
     * content format:
     * The 'content' member will be an array with the data of the tags.
     * If a element is a string, this means that the element is a raw html
     * content.
     * if a element is an object, this is a correctly compiled tag with the
     * following members.
     * 
     * {String} tag - The tag.
     * {String} params - The attributes setted in the tag.
     * {Array} childs - The child elements of this element.
     */
    static #internalCompilator(source, props = {})
    {
        if(typeof source === 'object')
        {
            if(!('source' in source)) return [];
            if('context' in source) this.context = source.context;
            if('props' in source) props = source.props;

            source = source.source;
        }
        
        if(typeof source !== 'string')
            source = '';

        if(source in TinyMLCore.#cache)
            return TinyMLCore.#cache[source];

        if(source.trim().length < 2)
            return {success: true, content: [{type: 'raw', content: source, compile: compile}]};

        if(source.startsWith('!') && source.endsWith('!'))
            return {success: true, content: [{type: 'raw', content: source.slice(1, -1), compile: compile}]};

        let chars = source.split(''),
            isParam = 0,
            codeLevel = 0,
            isString = !1,
            isComment = 0,
            contexts = {prev: {pos: this.context.pos, line: this.context.line}},
            content = {tag:'', prev: '', code: '', last: '', property: '', properties: {}},
            line = this.context.line,
            wasTag = !1,
            pos = 1,
            i = 0,
            isProperty = !1,
            splitted;

    f1: for(; i < chars.length; i++)
        {
            let c = chars[i];
            
            switch(!0)
            {
                case c === '[':
                    isComment++;
                    
                    if(isComment === 1)
                        contexts.comment = {pos: pos, line: line};

                    if(codeLevel === 0)
                        c = ''

                break;
                case c === ']':
                    isComment--;

                    if(codeLevel === 0)
                        c = ''

                break;
                case isComment > 0:
                    if(codeLevel === 0)
                        c = ''

                    break;
                case c === '"':
                    if(isString = !isString)
                        contexts.string = {pos: pos, line: line};

                break;
                case isString:
                break;
                case c === ';':
                    if(content.tag === '' || codeLevel > 0 || isParam > 0 || !('params' in content))
                        break;

                    contexts.last = {pos: i+1, line: line};
                    content.last = chars.slice(i+1).join('');
                    wasTag = true;

                break f1;
                case isSpace(c):
                    if(c === '\n')
                    {
                        if(chars[i+1] === '\r')
                            chars[i+1] = '';
                            
                        line++, pos = 0;
                    }

                    if(codeLevel > 0)
                        break;
                    
                    if(isParam > 0)
                        continue;

                    content.prev += content.tag + c, content.tag = '', c = '';
                break;
                case c === '@':
                    c = '';

                    if((isProperty = !isProperty) === !1)
                    {
                        c = content.properties[content.property] = extract(props, content.property);
                        content.property = '';
                    }
                    else
                        contexts.property = {line: line, pos: pos};
                break;
                case c === '(':
                    if(codeLevel > 0 || content.tag === '')
                        break;
                    
                    if(isParam > 0)
                        return TinyMLCore.#error(`Invalid use of '(' at `, line, pos);

                    if('params' in content)
                        return TinyMLCore.#error(`Duplicate use of '(' at `, line, pos);

                    contexts.params = {pos: pos, line: line};
                    isParam++;
                    content.params = '';
                continue;
                case c === ')':
                    if(isParam === 0)
                        break;

                    isParam--;
                continue;
                case c === ',':
                    if(isParam > 0)
                        c = ' ';

                break;
                case c === ':':
                    if(isParam > 0)
                        c = '=';

                break;
                case c === '{':
                    if(content.tag === '')
                        return TinyMLCore.#error(`Tag expected at `, line, pos);
                    
                    contexts.code = {pos: i+1, line: line};

                    if(++codeLevel === 1)
                    {
                        if(content.tag.includes(';'))
                            splitted = content.tag.split(';'), content.tag = splitted.pop(), content.prev += splitted.join(';');

                        continue;
                    }

                break;
                case c === '}':
                    if(--codeLevel < 0)
                        return TinyMLCore.#error(`Invalid code closure at `, line, pos);
                    
                    if(codeLevel > 0)
                        break;

                    contexts.last = {pos: i+1, line: line};
                    content.last = chars.slice(i+1).join('');
                    wasTag = true;

                    break f1;
                case c === '\\':
                    switch(chars[i+1])
                    {
                        case '[':
                        case ']':
                        case '@':
                        case '}':
                        case '{':
                            if(codeLevel > 0)
                                break;

                            c = chars[i+1];
                            chars[i+1] = '';
                            
                        break;
                    }
                break;
            }

            content[isProperty ? 'property' : codeLevel > 0 ? 'code' : isParam > 0 ? 'params' : 'tag'] += c, pos++;
        }

        if(isComment > 0)
            return TinyMLCore.#error(`Infinite comment since `, contexts.comment.line, contexts.comment.pos);
        else if(isString)
            return TinyMLCore.#error(`Infinite string since `, contexts.string.line, contexts.string.pos);
        else if(isParam > 0)
            return TinyMLCore.#error(`Infinite params since `, contexts.params.line, contexts.params.pos);
        else if(codeLevel > 0)
            return TinyMLCore.#error(`Infinite code since `, contexts.code.line, contexts.code.pos);
        else if(isProperty)
            return TinyMLCore.#error(`Infinite extern property name since `, contexts.property.line, contexts.property.pos);
        
        delete content.property;

        if(!wasTag && content.tag !== '')
            content.prev += content.tag, content.tag = '';
            
        return TinyMLCore.#success(source, content, props, contexts, this.first);
    }

    static compile(source, props = {})
    {
        return TinyMLCore.#internalCompilator.call({context: {pos: 0, line: 1}, first: true}, source, props);
    }

    // static compileAsync(source, props = {}, context = {pos: 0, line: 1}, first = true)
    static compileAsync(source, props = {})
    {
        return new Promise((resolve, reject) => {
            let compiled = TinyMLCore.compile(source, props)
            (compiled.success ? resolve : reject)(compiled);
        });
    }
}