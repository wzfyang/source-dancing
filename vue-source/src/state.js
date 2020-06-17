import { observe } from './observer/index';

export function initState(vm) {
    const opts = vm.$options;
    if (opts.props) {
        initProps(vm);
    } 
    if (opts.methods) {
        initMethods(vm);
    }
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function initProps(vm) {}
function initMethods(vm) {}
function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    proxy(vm, '_data', data);

    observe(data);

}
function initComputed(vm) {}
function initWatch(vm) {}

function proxy(vm, source, data) {
    Object.keys(data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm[source][key];
            },
            set(newValue) {
                vm[source][key] = newValue;
            }
        })
    })
}