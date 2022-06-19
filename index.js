"use strict";

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
function compile(source, properties = {}, context = {pos: 0, line: 1}, first = true)
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
        return [source.slice(1,-1)];

    const isSpace = (c) => ' \f\n\r\t\v'.includes(c);
    const error = (d) => {return {success: false, description: d}};
    const getContentByPropertyFormat = (f, obj) => f.split(f.includes('.') ? '.' : '>').reduce((o, e) => o[e], obj);

    function success(contents, properties, contexts, isFirst)
    {
        // function parse(params)
        // {
        //     let res = {}, prop = '', lastProp = '', value = '', inValue = !1; 

        //     params.split('').forEach(c => {
        //         switch(c)
        //         {
        //             case ' ':
        //                 if(prop !== '')
        //                     lastProp = prop;
        //                 else

        //                 prop = '';
        //             break;
        //             case '=':
        //             break;
        //         }
        //     });

        //     return res;
        // }

        let res = [];

        if(contents.prev.trim() !== '')
            res.push(contents.prev);

        if(contents.tag !== '')
            res.push({tag: contents.tag, params: contents.params === '' ? undefined : contents.params, childs: compile(contents.actual, properties, contexts.actual, false)});

        if(content.last.trim() !== '')
            res.push(...compile(contents.last, properties, contexts.last, false));

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
        content = {tag:'', prev: '', actual: '', last: '', params: '', property: ''},
        line = context.line,
        wasTag = !1,
        pos = 1,
        i = 0,
        isProperty = !1;

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
            case c === '"':
                if(isString = !isString)
                    contexts.string = {pos: pos, line: line};

            break;
            case isComment > 0:
                if(codeLevel === 0)
                    c = ''

                break;
            case isString:
            break;
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
                if(codeLevel > 0)
                    break;
                
                if(isParam > 0)
                    return error(`Invalid use of '(' at ${line}:${pos}`);

                if(content.tag === '')
                    break;

                contexts.params = {pos: pos, line: line};
                isParam++;
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
                
                if(++codeLevel === 1)
                    continue;

                contexts.actual = {pos: i+1, line: line};
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

        content[isProperty ? 'property' : codeLevel > 0 ? 'actual' : isParam > 0 ? 'params' : 'tag'] += c, pos++;
    }

    if(isComment > 0)
        return error(`Infinite comment since ${contexts.comment.line}:${contexts.comment.pos}`);
    else if(isString)
        return error(`Infinite string since ${contexts.string.line}:${contexts.string.pos}`);
    else if(isParam > 0)
        return error(`Infinite params since ${contexts.params.line}:${contexts.params.pos}`);

    if(!wasTag && content.tag !== '')
        content.prev += content.tag, content.tag = '';
        
    return success(content, properties, contexts, first);
}

const selfCloseTags = ['img', 'br', 'input', 'link', 'meta', 'area', 'source', 'base', 'col', 'option', 'embed', 'hr', 'param', 'track'];
const toParams = (params) => (params || '')  === '' ? '' : ` ${params}`;

let langs = {html: (obj) =>
    {
        if(typeof obj === 'string')
            return obj;
    
        let params = toParams(obj.params);
    
        if(selfCloseTags.includes(obj.tag))
            return `<${obj.tag}${params}/>`;
    
        let source = `<${obj.tag}${params}>`;
    
        obj.childs.forEach(e => {
            source += langs.html(e);
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
function translate(source, properties = {}, lang = 'html')
{
    if(typeof properties === 'string')
        lang = properties, properties = {};

    let compiled = compile(source, properties);

    if(!compiled.success)
        return compiled;

    if(!(lang in langs))
        return {success: false, description: 'The translate lang doesn\'t exists'};

    return {success: true, content: compiled.content.reduce((generated, element, index, array) => {
        return generated += langs[lang](element, index, array);
    }, '')};
}

/**
 * 
 * @param {String} lang - The lang to create or overwrite.
 * @param {Function|Boolean} callback - Falsy if you want to delete the lang.
 */
function setLang(lang, callback)
{
    if(typeof lang !== 'string')
        return;

    if(!callback)
        delete langs[lang];

    if(typeof callback !== 'function')
        return;

    langs[lang] = callback;
}

module.exports = Object.freeze({compile: compile, translate: translate, setLang: setLang});