import { createElement,createTextNode } from './vdom/create-element';

export function renderMixin(Vue) {
    Vue.prototype._render = function () {
        const vm = this;
        const vnode = this.$options.render.call(vm);
        return vnode;   
    }

    Vue.prototype._c = function () {
        return createElement(...arguments);
    }

    Vue.prototype._v = function (text) {
        return createTextNode(text);
    }

    Vue.prototype._s = function (val) {
        return val == null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val);
    }
}