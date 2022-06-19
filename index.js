"use strict"

function compile(source, properties = {}, context = {pos: 0, line: 1})
{
    if(typeof source === 'object')
    {
        source = source.source;

        if(typeof source.context !== 'undefined')
            context = source.context;

        if(typeof source.properties !== 'undefined')
            properties = source.properties;
    }

    if(typeof source !== 'string')
        return [];

    if(source.trim().length < 2)
        return [source];

    if(source.startsWith('!') && source.endsWith('!'))
        return [source.slice(1,-1)];

    function isSpace(c)
    {
        return ' \f\n\r\t\v'.includes(c)
    }

    function error(description)
    {
        return {success: false, description: description};
    }

    function getContentByPropertyFormat(format, object)
    {
        return format.split('.').reduce((o, e) => o[e], object);
    }

    function success(contents, properties, contexts)
    {
        function parse(params)
        {
            let res = {}, prop = '', lastProp = '', value = '', inValue = !1; 

            params.split('').forEach(c => {
                switch(c)
                {
                    case ' ':
                        if(prop !== '')
                            lastProp = prop;
                        else

                        prop = '';
                    break;
                    case '=':
                    break;
                }
            });

            return res;
        }

        let res = [];

        if(contents.prev.trim() !== '')
            res.push(contents.prev);

        if(contents.tag !== '')
            res.push({tag: contents.tag, params: contents.params === '' ? undefined : contents.params, childs: compile(contents.actual, properties, contexts.actual)});

        if(content.last.trim() !== '')
            res.push(...compile(contents.last, properties, contexts.last));

        return res;
    }

    let chars = source.split(''),
        isParam = 0,
        codeLevel = 0,
        isString = !1,
        isComment = 0,
        contexts = {params: {}, prev: {pos: context.pos, line: context.line}, actual: {wasTag: !1}, last: {pos: 0, line: 0}},
        content = {tag:'', prev: '', actual: '', last: '', params: '', property: ''},
        line = context.line,
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
                // DoNothing()

            break;
            case isSpace(c):
                if(c === '\n')
                {
                    // console.log('[', chars[i+1], ']');
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
            case c === '(':
                if(codeLevel > 0)
                    break;
                
                if(isParam > 0)
                    return error(`Invalid use of '(' at ${line}:${pos}`);

                if(content.tag === '')
                    // return error(`Tag expected at ${line}:${context.pos+i}`);
                    break;

                contexts.params = {pos: pos, line: line};
                isParam++;
            continue;
            case c === ')':
                if(isParam === 0)
                    // return error(`Invalid param closure at ${line}:${pos}`);
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
                contexts.actual.wasTag = true;

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

    if(isString)
        return error(`Infinite string since ${contexts.string.line}:${contexts.string.pos}`);

    if(isParam > 0)
        return error(`Infinite params since ${contexts.params.line}:${contexts.params.pos}`);

    if(!contexts.actual.wasTag && content.tag !== '')
        content.prev += content.tag, content.tag = '';
        
    return success(content, properties, contexts);
}

module.exports = Object.freeze({compile: compile});
