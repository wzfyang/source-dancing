import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;
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

        this.id = id++;
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
        console.log('更新')
        this.getter();
    }
}

export default Watcher;