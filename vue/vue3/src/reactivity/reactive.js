import { isObject } from '../shared/utils';
import { mutableHandler } from './baseHanders';

export function reactive(target) {

    return createReactiveObject(target, mutableHandler);
}

function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        return;
    }

    const observed = new Proxy(target, baseHandler);
    return observed;
}