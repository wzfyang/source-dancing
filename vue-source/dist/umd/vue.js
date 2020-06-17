(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    const LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed'
    ];

    const strats = [];
    function mergeHook(parentVal, childVal) {
        if (childVal) {
            if (parentVal) {
                return parentVal = parentVal.concat(childVal);
            } else {
                return [childVal];
            }
        } else {
            return parentVal;
        }
    }

    LIFECYCLE_HOOKS.forEach(hook => {
        strats[hook] = mergeHook;
    });

    function mergeOptions(parent, child) {
        const options = {};
        for(let key in parent) {
            mergeField(key);
        }

        for (let key in child) {
            if (!parent.hasOwnProperty(key)) {
                mergeField(key);
            }
        }

        function mergeField(key) {
            if (strats[key]) {
                options[key] = strats[key](parent[key], child[key]);
            } else {
                if (typeof parent[key] === 'object' && typeof child[key] === 'object') {
                    options[key] = {
                        ...parent[key],
                        ...child[key]
                    };
                } else {
                    options[key] = child[key];
                } 
            }
        }
        return options;
    } 

    function callHook(vm, hook) {
        const hanlder = vm.$options[hook];
        if (hanlder) {
            hanlder.forEach(fn => {
                fn.call(vm);
            });
        }
    }

    function isObject(value) {
        return typeof value === 'object' && value !== null;
    }

    const oldPrototype = Array.prototype;
    let arrayMethods = Object.create(oldPrototype);

    const methods = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'reverse',
        'sort'
    ];

    methods.forEach((method, index) => {

        arrayMethods[method] = function(...args) {
            const result = oldPrototype[method].apply(this, args);
            const ob = this.__ob__;
            let inserted;
            switch(method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
        
            }

            inserted && ob.observeArray(inserted);
            
            ob.dep.notify();

            return result;
        };
    });

    let id = 0;
    class Dep {
        constructor() {
            this.id = id++;
            this.subs = [];
        }

        depend() {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        }

        addSub(watcher) {
            this.subs.push(watcher);
        }

        notify() {
            this.subs.forEach(watcher => watcher.update());
        }
    }

    Dep.target = null;
    let stack = [];

    function pushTarget(watcher) {
        Dep.target = watcher;
        stack.push(watcher);
    }

    function popTarget() {
        stack.pop();
        Dep.target = stack[stack.length - 1];
    }

    class Observer {
        constructor(data) {
            Object.defineProperty(data, '__ob__', {
                configurable: false,
                enumerable: false,
                value: this
            });

            this.dep = new Dep();
            if (Array.isArray(data)) {
                data.__proto__ = arrayMethods;
                this.observeArray(data);
            } else {
                this.walk(data);
            }
        }

        observeArray(array) {
            array.map(item => {
                observe(item);
            });
        }


        walk(data) {
            Object.keys(data).forEach(key => {
                defineReactive(data, key, data[key]);
            });
        }
    }

    function defineReactive(data, key, value) {
        const dep = new Dep();
        let childOb = observe(value);
        Object.defineProperty(data, key, {
            get() {
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                        if (Array.isArray(value)) {
                            dependArray(value);
                        }
                    }
                }
                return value;
            },
            set(newValue) {
                if (newValue === value) {
                    return;
                }
                observe(newValue);
                value = newValue;

                dep.notify();
            }
        });
    }

    function dependArray(value) {
        for (let i = 0; i < value.length; i++) {
            let el = value[i];
            if (Array.isArray(el)) {
                dependArray(el);
            }
        }
    }

    function observe(value) {
        if (!isObject(value)) {
            return;
        }
        let ob;
        if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else {
            ob = new Observer(value);
        }

        return ob;
    }

    function initState(vm) {
        const opts = vm.$options;
        if (opts.props) ; 
        if (opts.methods) ;
        if (opts.data) {
            initData(vm);
        }
        if (opts.computed) ;
        if (opts.watch) ;
    }
    function initData(vm) {
        let data = vm.$options.data;
        data = vm._data = typeof data === 'function' ? data.call(vm) : data;

        proxy(vm, '_data', data);

        observe(data);

    }

    function proxy(vm, source, data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(vm, key, {
                get() {
                    return vm[source][key];
                },
                set(newValue) {
                    vm[source][key] = newValue;
                }
            });
        });
    }

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
    const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

    let root;
    let currentParent = null;
    let stack$1 = [];
    const TYPE_ELEMENT = 1;
    const TYPE_TEXT = 3;

    function createASTElement(tagName, attrs) {
        return {
            tag: tagName,
            type: TYPE_ELEMENT,
            attrs: attrs,
            parent: null,
            children: []
        };
    }

    function start(tagName, attrs) {
        console.log('start', tagName);
        currentParent = createASTElement(tagName, attrs);
        if (!root) {
            root = currentParent;
        }
        stack$1.push(currentParent);

    }

    function end(result) {
        console.log('end', result);
        const element = stack$1.pop();
        currentParent = stack$1[stack$1.length - 1];
        if (currentParent) {
            element.parent = currentParent;
            currentParent.children.push(element);
        }

    }

    function chars(text) {
        console.log('chars', text);
        text = text.replace(/\s/g);
        if (text) {
            currentParent.children.push({
                type: TYPE_TEXT,
                text
            });
        }
    }

    function parseHTML(html) {
        // debugger
        html = html.replace(/[\r\n]/g, "");
        while(html) {
            html = html.replace(/(^\s*) | (\s*$)/g, "");
            let textEnd = html.indexOf('<');
            if (textEnd === 0) {
                const startTagMatch = parseStartTag();
                if (startTagMatch) {
                    start(startTagMatch.tagName, startTagMatch.attrs);
                    continue;
                }

                const endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    end(endTagMatch[0]);
                    advance(endTagMatch[0].length);
                    continue;
                }
                
            }

            let text;
            if (textEnd > 0) {
                text = html.substring(0, textEnd);
            }

            if (text) {
                chars(text);
                advance(text.length);
            }

        }

        function parseStartTag() {
            const startTag = html.match(startTagOpen);
            if (startTag) {
                const match = {
                    tagName: startTag[1],
                    attrs: []
                };

                advance(startTag[0].length);
                
                let attr, tagEnd;
                while(!(tagEnd = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    match.attrs.push({
                        name: attr[1],
                        value: attr[3]
                    });

                    advance(attr[0].length);
                }

                if (tagEnd) {
                    advance(tagEnd[0].length);
                    return match;
                }
            }
        }

        function advance(n) {
            html = html.substring(n);
        }

        return root;
    }

    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    function compileToFunction(template) {
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
                tokens.push(`${JSON.stringify(text.slice(lastIndex))}`);
            }

            return `_v(${tokens.join('+')})`;
        }
    }

    let callbacks = [];
    function flushCallbacks() {
        const copy = callbacks.slice(0);
        copy.forEach(cb => cb());

        callbacks.length = 0;
    }

    let timeFunc;
    if (Promise) {
        timeFunc = () => {
            Promise.resolve().then(flushCallbacks);
        };
    } else if (MutationObserver) {
        let observer = new MutationObserver(flushCallbacks);
        let textNode = document.createTextNode(1);
        observer.observe(textNode, {
            characterData: true
        });
        timeFunc = () => {
            textNode.textContent = 2;
        };
    } else if (setImmediate) {
        setImmediate(flushCallbacks, 0);
    } else if (setTimeout) {
        setTimeout(flushCallbacks, 0);
    }

    function nextTick(cb) {
        callbacks.push(cb);
        timeFunc();
    }

    let has = {};
    const queue = [];

    let pending = false;

    function flushSchedulerQueue() {
        queue.map(watcher => watcher.run());

        has = {};
        queue.length = 0;
    }

    function queueWatcher(watcher) {
        const id = watcher.id;
        if (!has[id]) {
            has[id] = true;
            queue.push(watcher);
            if (!pending) {
                nextTick(flushSchedulerQueue);
                pending = true;
            }
        }
        
    }

    let id$1 = 0;
    class Watcher {
        constructor(vm, exprOrFn, cb, options) {
            this.vm = vm;
            this.exprOrFn = exprOrFn;
            if (typeof exprOrFn == 'function') {
                this.getter = exprOrFn;
            }
            this.cb = cb;
            this.options = options;

            this.deps = [];
            this.depIds = new Set();

            this.id = id$1++;
            this.get();
        }

        addDep(dep) {
            let id = dep.id;
            if (!this.depIds.has(id)) {
                this.depIds.add(id);
                this.deps.push(dep);
                dep.addSub(this);
            }
        }

        get() {
            pushTarget(this);
            this.getter();
            popTarget();
        }

        update() {
            
            queueWatcher(this);
        }

        run() {
            console.log('更新');
            this.getter();
        }
    }

    function patch(oldVnode, vnode) {
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
                });
            } else if (key === 'class') {
                el.className = data.class;
            } else {
                el.setAttribute(key, data[key]);
            }
        }
    }

    function lifecycleMixin(Vue) {
        Vue.prototype._update = function (vnode) {
            const vm = this;
            vm.$el = patch(vm.$el, vnode);
        };
    }

    function mountComponent(vm, el) {
        vm.$el = el;

        let updateComponent = () => {
            vm._update(vm._render());
        };

        new Watcher(vm, updateComponent, ()=>{}, true);
    }

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            const vm = this;
            vm.$options = mergeOptions(vm.constructor.options, options);

            callHook(vm, 'beforeCreate');
            initState(vm);
            callHook(vm, 'created');

            if (vm.$options.el) {
                vm.$mount(vm.$options.el);
            }
        };

        Vue.prototype.$mount = function (el) {
            const vm = this;
            const options = vm.$options;
            vm.$el = el = document.querySelector(el);

            if (!options.render) {
                let template = options.template;

                if (!template && el) {
                    template = el.outerHTML;
                }

                const render = compileToFunction(template);
                options.render = render;
            }

            callHook(vm, 'beforeMount');
            mountComponent(vm, el);
            callHook(vm, 'mounted');
        }; 
    }

    function createElement(tag, data = {}, ...children) {
        const key = data.key;
        if (key) {
            delete data.key;
        }

        return vnode(tag, data, key, children,)
    }

    function createTextNode(text) {
        return vnode(undefined, undefined, undefined, undefined, text);
    }

    function vnode(tag, data, key, children, text) {
        return {
            tag,
            data,
            key,
            children,
            text
        }
    }

    function renderMixin(Vue) {
        Vue.prototype._render = function () {
            const vm = this;
            const vnode = this.$options.render.call(vm);
            return vnode;   
        };

        Vue.prototype._c = function () {
            return createElement(...arguments);
        };

        Vue.prototype._v = function (text) {
            return createTextNode(text);
        };

        Vue.prototype._s = function (val) {
            return val == null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val);
        };
    }

    function initGlobalAPI(Vue) {
        Vue.options = {};
        
        Vue.mixin = function (mixin) {
            this.options = mergeOptions(this.options, mixin);
            return this;
        };
    }

    function Vue(options) {
        this._init(options);
    }

    initMixin(Vue); // 定义原型_init, $mount方法
    renderMixin(Vue);
    lifecycleMixin(Vue);

    initGlobalAPI(Vue);

    return Vue;

})));
//# sourceMappingURL=vue.js.map
