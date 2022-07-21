const selfCloseTags = ['img', 'br', 'input', 'link', 'meta', 'area', 'source', 'base', 'col', 'option', 'embed', 'hr', 'param', 'track'];
const htmlTags = ['a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdo', 'blockquote', 'body', 'html', 'head', 'title', 'button', 'form', 'cite', 'code', 'colgroup', 'command', 'strong', 'u', 'datalist', 'dd', 'table', 'th', 'tr', 'td', 'thead', 'tfoot', 'tbody', 'var', 'p', 'wbr', 'sup', 'sub', 'style', 'span', 'small', 'select', 'option', 'script', 'section', 'main', 'header', 'footer', 'samp', 's', 'ruby', 'rt', 'rp', 'q', 'progress', 'pre', 'output', 'optgroup', 'ol', 'li', 'ul', 'noscript', 'object', 'nav', 'meter', 'fieldset', 'legend', 'kbd', 'ins', 'iframe', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption', 'em', 'dt', 'dl', 'div', 'details', 'dfn', 'del'];
const toParams = params => (params || '')  === '' ? '' : ` ${params}`;

function escape(raw)
{
    return raw.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export default function translator(props)
{
    if(typeof props === 'undefined')
        return 'string';

    if(this.type === 'raw')
        return escape(this.content);
    else if(this.type === 'pure')
        return this.content;

    let params = toParams(this.params);

    if(selfCloseTags.includes(this.tag))
        return `<${this.tag}${params}/>`;

    let content = this.childs.reduce((acc, val) =>
    {
        return acc += val.translate(props);
    }, '');

    if(this.tag === '!')
        return content;

    return `<${this.tag}${params}>${content}</${this.tag}>`;
}