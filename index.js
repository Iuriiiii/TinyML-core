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

export default class TinyMLCore
{
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
    static compile(source, properties = {}, context = {pos: 0, line: 1}, first = true)
    {
        if(typeof source === 'object')
        {
            if(!('source' in source)) return [];
            if('context' in source) context = source.context;
            if('properties' in source) properties = source.properties;

            source = source.source;
        }
        else if(typeof source !== 'string')
            return [];

        if(source.trim().length < 2)
            return [source];

        if(source.startsWith('!') && source.endsWith('!'))
            return [source.slice(1, -1)];

        const isSpace = char => ' \f\n\r\t\v'.includes(char);
        const error = desc => ({success: false, description: desc});
        const getContentByPropertyFormat = (f, obj) => {
            let m = f.split(f.includes('.') ? '.' : '>');
    
            if(typeof obj === 'function')
                obj = obj(m, f) || {};
            
            return m.reduce((o, e) => o[e], obj);
        };

        function success(contents, properties, contexts, isFirst)
        {
            let res = [];

            if(contents.prev.trim() !== '')
                res.push(contents.prev);

            if(contents.tag !== '')
                res.push({tag: contents.tag, params: contents.params === '' ? undefined : contents.params, childs: TinyMLCore.compile(contents.code, properties, contexts.code, false)});

            if(content.last.trim() !== '')
                res.push(...TinyMLCore.compile(contents.last, properties, contexts.last, false));

            if(isFirst)
                res = {success: true, content: [...res]};

            return res;
        }

        let chars = source.split(''),
            isParam = 0,
            codeLevel = 0,
            isString = !1,
            isComment = 0,
            contexts = {prev: {pos: context.pos, line: context.line}},
            content = {tag:'', prev: '', code: '', last: '', property: ''},
            line = context.line,
            wasTag = !1,
            pos = 1,
            i = 0,
            isProperty = !1,
            splitted;

    f1: for(; i < chars.length; i++)
        {
            let c = chars[i];
            
            switch(true)
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
                case c === '%':
                    c = '';

                    if((isProperty = !isProperty) === !1)
                        c = getContentByPropertyFormat(content.property, properties);

                    content.property = '';
                break;
                case c === '(':
                    if(codeLevel > 0 || content.tag === '')
                        break;
                    
                    if(isParam > 0)
                        return error(`Invalid use of '(' at ${line}:${pos}`);

                    if('params' in content)
                        return error(`Duplicate use of '(' at ${line}:${pos}`);

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
                        return error(`Tag expected at ${line}:${pos}`);
                    
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
                        return error(`Invalid code closure at ${line}:${pos}`);
                    
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
                        case '%':
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
            return error(`Infinite comment since ${contexts.comment.line}:${contexts.comment.pos}`);
        else if(isString)
            return error(`Infinite string since ${contexts.string.line}:${contexts.string.pos}`);
        else if(isParam > 0)
            return error(`Infinite params since ${contexts.params.line}:${contexts.params.pos}`);
        else if(codeLevel > 0)
            return error(`Infinite code since ${contexts.code.line}:${contexts.code.pos}`);

        if(!wasTag && content.tag !== '')
            content.prev += content.tag, content.tag = '';
            
        return success(content, properties, contexts, first);
    }

    static compileAsync(source, properties = {}, context = {pos: 0, line: 1}, first = true)
    {
        return new Promise((resolve, reject) => {
            let compiled = TinyMLCore.compile(source, properties, context, first)

            if(compiled.success)
                resolve(compiled.content);
            else
                reject(compiled.description);
        });
    }

    static #selfCloseTags = ['img', 'br', 'input', 'link', 'meta', 'area', 'source', 'base', 'col', 'option', 'embed', 'hr', 'param', 'track'];
    static toParams = (params) => (params || '')  === '' ? '' : ` ${params}`;
    static #langs = {html: (obj) =>
        {
            if(typeof obj === 'string')
                return obj.replaceAll('\\n','<br>');
        
            let params = TinyMLCore.toParams(obj.params);
        
            if(TinyMLCore.#selfCloseTags.includes(obj.tag))
                return `<${obj.tag}${params}/>`;
        
            let source;

            switch(obj.tag)
            {
                case 'html5': obj.tag = 'html', source = `<!DOCTYPE html><html${params}>`;
                break;
                default: source = `<${obj.tag}${params}>`;
            }
            
            obj.childs.forEach(e => {
                source += TinyMLCore.#langs.html(e);
            });
        
            return `${source}</${obj.tag}>`;
        }
    };

    /**
     *  * Traduces TinyML's source code to HTML's source code.
     * 
     * @param {String} source - The TinyML's source code.
     * @param {Object|String} properties 
     * @param {String} [lang=html] - The lang to translate.
     * @returns {Object}
     * 
     * The return will be an object with a boolean member called 'success'
     * with the status of the translation and other one called 'content'
     * containing the translation as a string.
     * 
     * Example I:
     *  {success: true, content: '<html><h1>Hello World</h1></html>'}
     * 
     */
    static translate(source, properties = {}, lang = 'html')
    {
        if(typeof properties === 'string')
            lang = properties, properties = {};

        let compiled = TinyMLCore.compile(source, properties);

        if(!compiled.success)
            return compiled;

        let langs = TinyMLCore.#langs;

        if(!(lang in langs))
            return {success: false, description: 'The translate lang doesn\'t exists'};

        return {success: true, content: compiled.content.reduce((generated, element, index, array) => {
            return generated += langs[lang](element, index, array);
        }, '')};
    }

    /**
     * Gets or sets a lang engine.
     * 
     * @param {String} lang
     * @param {Function|Null} [callback]
     * 
     * If just the first param is set, the engine function of the lang will be returned,
     * otherwise, all the langs will be returned with their respective engine functions.
     * If the first param is set and the second one is a function, the engine function
     * will be set on the lang.
     * If the first param is set and the second one is null, the actual engine function
     * of the lang will be deleted.
     * 
     */
    static langEngine(lang, callback)
    {
        let langs = TinyMLCore.#langs;

        switch(typeof lang)
        {
            case 'undefined': return langs;
            case 'string':
                if(callback === null)
                {
                    delete langs[lang];
                    return;
                }
            
                switch(typeof callback)
                {
                    case 'undefined': return langs[lang];
                    case 'function': langs[lang] = callback;
                    default: return;
                }
            default: return;
        }
    }
}

if(typeof module !== 'undefined')
    module.exports = TinyMLCore;