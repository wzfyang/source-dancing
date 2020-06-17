export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType;
    
    if (isRealElement) {
        const oldElm = oldVnode;
        const parentElm = oldElm.parentNode;

        const el = createElm(vnode);
        parentElm.insertBefore(el, oldElm.nextSibling);
        parentElm.removeChild(oldElm);
        return el;
    }
}

function createElm(vnode) {
    let { tag, data, key, children, text} = vnode;

    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }

    return vnode.el;
}

function updateProperties(vnode) {
    const data = vnode.data || {};
    const el = vnode.el;
    for (let key in data) {
        if (key === 'style') {
            const style = data.style;
            Object.keys(style).forEach(styleName => {
                el.style[styleName] = data.style[styleName];
            })
        } else if (key === 'class') {
            el.className = data.class;
        } else {
            el.setAttribute(key, data[key]);
        }
    }
}