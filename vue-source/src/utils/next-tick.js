let callbacks = [];
function flushCallbacks() {
    const copy = callbacks.slice(0);
    copy.forEach(cb => cb());

    callbacks.length = 0;
}

let timeFunc;
if (Promise) {
    timeFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timeFunc = () => {
        textNode.textContent = 2;
    }
} else if (setImmediate) {
    setImmediate(flushCallbacks, 0);
} else if (setTimeout) {
    setTimeout(flushCallbacks, 0);
}

export function nextTick(cb) {
    callbacks.push(cb);
    timeFunc();
}