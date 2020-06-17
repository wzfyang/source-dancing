import { isObject } from '../utils/index';
import { arrayMethods } from '../array'
import Dep from './dep';

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
        })
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
    })
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let el = value[i];
        if (Array.isArray(el)) {
            dependArray(el);
        }
    }
}

export function observe(value) {
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