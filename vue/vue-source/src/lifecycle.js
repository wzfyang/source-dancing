import Watcher from './observer/watcher'
import { patch } from './vdom/patch';

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        const preVnode = vm._vnode;
        vm._vnode = vnode;
        if (!preVnode) {
            vm.$el = patch(vm.$el, vnode);
        } else {
            vm.$el = patch(preVnode, vnode);
        }

        vm.$el = patch(vm.$el, vnode);
    }
}

export function mountComponent(vm, el) {
    vm.$el = el;

    let updateComponent = () => {
        vm._update(vm._render());
    }

    new Watcher(vm, updateComponent, ()=>{}, true);
}