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



function htmlCompilator()
{

}

function compile(props, compilator = htmlCompilator)
{
    return compilator.call(this, props);
}

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
    static compile(source, props = {}, context = {pos: 0, line: 1}, first = true)
    {
        if(typeof source === 'object')
        {
            if(!('source' in source)) return [];
            if('context' in source) context = source.context;
            if('props' in source) props = source.props;

            source = source.source;
        }
        
        if(typeof source !== 'string')
            return [];

        if(source.trim().length < 2)
            return [source];

        if(source.startsWith('!') && source.endsWith('!'))
            return [source.slice(1, -1)];

        const isSpace = char => ' \f\n\r\t\v'.includes(char);
        const error = (description, line, position) => ({
            success: false,
            description: `${description}${line}:${position}`,
            line: line, position: position
        });

        const extract = (obj, expr, del = '>') =>
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
        };

        const success = (source, contents, props, contexts, isFirst) =>
        {
            let res = [];

            if(contents.prev.trim() !== '')
                res.push(contents.prev);

            if(contents.tag !== '')
            {
                let srcHash = hashString(source);
                let propValues = Object.values(content.properties);

                res.push({
                    srcHash: srcHash,
                    fullHash: srcHash + hashString(propValues.join('')),
                    source: source,
                    tag: contents.tag,
                    params: contents.params,
                    hasProps: propValues.length > 0,
                    props: content.properties,
                    childs: TinyMLCore.compile(contents.code, props, contexts.code, false),
                    compile: compile
                });
            }

            if(content.last.trim() !== '')
                res.push(...TinyMLCore.compile(contents.last, props, contexts.last, false));

            if(isFirst)
                res = {
                    success: true,
                    content: [...res]
                };

            return res;
        }

        let chars = source.split(''),
            isParam = 0,
            codeLevel = 0,
            isString = !1,
            isComment = 0,
            contexts = {prev: {pos: context.pos, line: context.line}},
            content = {tag:'', prev: '', code: '', last: '', property: '', properties: {}},
            line = context.line,
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
                        return error(`Invalid use of '(' at `, line, pos);

                    if('params' in content)
                        return error(`Duplicate use of '(' at `, line, pos);

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
                        return error(`Tag expected at `, line, pos);
                    
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
                        return error(`Invalid code closure at `, line, pos);
                    
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
            return error(`Infinite comment since `, contexts.comment.line, contexts.comment.pos);
        else if(isString)
            return error(`Infinite string since `, contexts.string.line, contexts.string.pos);
        else if(isParam > 0)
            return error(`Infinite params since `, contexts.params.line, contexts.params.pos);
        else if(codeLevel > 0)
            return error(`Infinite code since `, contexts.code.line, contexts.code.pos);
        else if(isProperty)
            return error(`Infinite extern property name since `, contexts.property.line, contexts.property.pos);
        
        delete content.property;

        if(!wasTag && content.tag !== '')
            content.prev += content.tag, content.tag = '';
            
        return success(source, content, props, contexts, first);
    }

    static compileAsync(source, props = {}, context = {pos: 0, line: 1}, first = true)
    {
        return new Promise((resolve, reject) => {
            let compiled = TinyMLCore.compile(source, props, context, first)

            if(compiled.success)
                resolve(compiled.content);
            else
                reject(compiled.description);
        });
    }
}