export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType;
    
    if (isRealElement) {
        const oldElm = oldVnode;
        const parentElm = oldElm.parentNode;

        const el = createElm(vnode);
        parentElm.insertBefore(el, oldElm.nextSibling);
        parentElm.removeChild(oldElm);
        return el;
    } else {
        if (oldVnode.tag !== vnode.tag) {
            oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        } 
        if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
                oldVnode.el.text = vnode.text;
            }
        }

        let el = vnode.el = oldVnode.el;
        updateProperties(vnode, oldVnode.data);

        let oldChildren = oldVnode.children;
        let newChildren = vnode.children;

        if (oldChildren.length > 0 && newChildren.length > 0) {
            // 比较子节点
            updateChildren(el, oldChildren, newChildren);
        } else if (oldChildren.length > 0) {
            el.innerHTML = '';
        } else {
            newChildren.forEach(child => {
                el.appendChild(createElm(child));
            })
        }

    }
}

function updateChildren(parent, oldChildren, newChildren) {
    let oldStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let oldStartChild = oldChildren[0];
    let oldEndChild = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;
    let newStartChild = newChildren[0];
    let newEndChild = newChildren[newEndIndex];

    let map = makeIndexByKey(oldChildren);

    while ((oldStartIndex <= oldEndIndex) && (newStartIndex <= newEndIndex)) {
        if (!oldStartChild) {
            oldStartChild = oldChildren[++oldStartIndex];
            continue;
        } else if (!oldEndChild) {
            oldEndChild = oldChildren[--oldEndIndex];
            continue;
        }

        if (isSameNode(oldStartChild, newStartIndex)) {
            patch(oldStartChild, oldEndChild);
            oldStartChild = oldChildren[++oldStartIndex];
            newStartChild = newChildren[++newStartIndex];
        } else if (isSameNode(oldEndChild, newEndChild)) {
            patch(oldEndChild, newEndChild);
            oldEndChild = oldChildren[--oldEndIndex];
            newEndChild = newChildren[--newEndIndex];
        } else if (isSameNode(oldStartChild, newEndChild)) {
            patch(oldStartChild, newEndChild);
            parent.insertBefore(oldStartChild.el, oldEndChild.el.nextSibling);
            oldStartChild = oldChildren[++oldStartIndex];
            newEndChild = newChildren[--newEndIndex];
        } else if (isSameNode(oldEndChild, newStartChild)) {
            patch(oldEndChild, newStartChild);
            parent.insertBefore(oldEndChild.el, oldStartChild.el);
            oldEndChild = oldChildren[--oldEndIndex];
            newStartChild = newChildren[++newStartIndex];
        } else {
            let oldIndex = map[newStartChild.key];
            let moveChild ;
            if (oldIndex) {
                moveChild = oldChildren[oldIndex];
                oldChildren[oldIndex] = null;   
                patch(moveChild, newStartChild);
            } else {
                moveChild = createElm(newStartChild);
            }
            
            parent.insertBefore(moveChild.el, oldStartChild.el);
            newStartChild = newChildren[++newStartIndex];
        }
    }

    if (oldStartIndex <= oldEndIndex) {
        for (let index = oldStartIndex; index <= oldEndIndex; index++) {
            let child = oldChildren[index];
            if (child) {
                parent.removeChild(child.el);
            }
        }
    }
    // if (newStartIndex < newEndIndex) {
    //     for (let index = newStartIndex; index <= newEndIndex; index++) {
    //         parent.appendChild
    //     }
    // }

}

function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
        map[child.key] = index;
    })

    return map;
}

function isSameNode(oldVnode, newVnode) {
    return oldVnode.key === newVnode && oldVnode.tag === newVnode.tag;
}

export function createElm(vnode) {
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

function updateProperties(vnode, oldProps = {}) {
    const newProps = vnode.data || {};
    const el = vnode.el;

    const oldStyle = oldProps.style;
    const newStyle = newProps.style;

    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = '';
        }
    }

    for (let key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key);
        }
    }

    for (let key in newProps) {
        if (key === 'style') {
            Object.keys(newStyle).forEach(styleName => {
                el.style[styleName] = newStyle[styleName];
            })
        } else if (key === 'class') {
            el.className = newProps.class;
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}