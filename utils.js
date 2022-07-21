/* https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript */
export function hashString(s)
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

export function extract(obj, expr, del = '>')
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

export function isSpace(char)
{
    return ' \f\n\r\t\v'.includes(char);
}