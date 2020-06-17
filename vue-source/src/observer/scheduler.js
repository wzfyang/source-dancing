import { nextTick } from "../utils/next-tick";


let has = {};
const queue = [];

let pending = false;

function flushSchedulerQueue() {
    queue.map(watcher => watcher.run());

    has = {};
    queue.length = 0;
}

export function queueWatcher(watcher) {
    const id = watcher.id;
    if (!has[id]) {
        has[id] = true;
        queue.push(watcher);
        if (!pending) {
            nextTick(flushSchedulerQueue)
            pending = true;
        }
    }
    
}