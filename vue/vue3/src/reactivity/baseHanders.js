import { isObject } from "util";
import { reactive } from "./reactive";
import { hasOwn, hasChanged } from "../shared/utils";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operation";

const get = createGetter();
const set = createSetter();

function createGetter() {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);

        track(target, TrackOpTypes.GET, key);
        if (isObject(res)) {
            return reactive(res);
        }
        return res;
    }
}
function createSetter() {
    return function set(target, key, value, receiver) {
        const hadKey = hasOwn(target, key);
        const oldVal = target[key];
        const result = Reflect.set(target, key, value, receiver);
        
        if (!hadKey) {
            // 新增
            trigger(target, TriggerOpTypes.ADD, key, value, oldVal);
        } else if (hasChanged(oldVal, value)) {
            // 修改
            trigger(target, TriggerOpTypes.SET, key, value, oldVal);
        }
        return result;
    }
}

export const mutableHandler = {
    get,
    set
}