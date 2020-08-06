import { parseHTML } from './parse-html'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function compileToFunction(template) {
    const ast = parseHTML(template);
    console.log('ast', ast);
    const code = generate(ast);
    console.log('code', code);
    const render = `with(this){return ${code}}`;
    console.log('render', render);
    return new Function(render);
}

function generate(el) {
    const children = getChildren(el);
    return `_c('${el.tag}', ${el.attrs.length > 0 ? genProps(el.attrs) : undefined}${children ? `,${children}` : ''})`;
}

function getChildren(el) {
    if (el && el.children && el.children.length > 0) {
        return `${el.children.map(c => {
            return gen(c);
        }).join(',')}`
    } else {
        return false;
    }
}

function genProps(attrs) {
    let str = '';
    attrs.forEach(attr => {
        let obj = {};
        if (attr.name === 'style') {
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        } 
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    });

    return `{${str.slice(0, -1)}}`;
}

function gen(node) {
    if (node.type === 1) {
        return generate(node);
    } else {
        // debugger
        const text = node.text;
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        }

        const tokens = [];
        let lastIndex = defaultTagRE.lastIndex = 0;
        let index = lastIndex = 0;
        let match;
        while(match = defaultTagRE.exec(text)) {
            index = match.index;
            if (index > lastIndex) {
                tokens.push(`'${JSON.stringify(text.slice(lastIndex, index))}'`);
            }

            tokens.push(`_s(${match[1]})`);
            lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
            tokens.push(`${JSON.stringify(text.slice(lastIndex))}`)
        }

        return `_v(${tokens.join('+')})`;
    }
}