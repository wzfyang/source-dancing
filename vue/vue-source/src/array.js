const oldPrototype = Array.prototype;
export let arrayMethods = Object.create(oldPrototype);

const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'reverse',
    'sort'
]

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
            default:
    
        }

        inserted && ob.observeArray(inserted);
        
        ob.dep.notify();

        return result;
    }
})