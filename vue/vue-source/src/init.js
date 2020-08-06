import { initState } from './state';
import { compileToFunction } from './compile/index';
import { mountComponent } from './lifecycle';
import { mergeOptions, callHook } from './utils/index';

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = mergeOptions(vm.constructor.options, options);

        callHook(vm, 'beforeCreate');
        initState(vm);
        callHook(vm, 'created');

        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }

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

        callHook(vm, 'beforeMount')
        mountComponent(vm, el);
        callHook(vm, 'mounted');
    } 
}