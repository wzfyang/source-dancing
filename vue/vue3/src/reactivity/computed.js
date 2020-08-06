import { isFunction } from "util";
import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operation";


export function computed(getterOrOptions) {
    let getter;
    let setter;

    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = () => {};
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }

    let dirty = true;
    let computed;

    let runner = effect(getter, {
        lazy: true,
        computed: true,
        scheduler: () => {
            if (!dirty) {
                dirty = true;
                trigger(computed, TriggerOpTypes.SET, )
            }
        }
    })

    let value;
    computed = {
        get value() {
            if (dirty) {
                dirty = false;
                value = runner();
                track(computed, TrackOpTypes.GET, 'value');
            }
            return value;
        },
        set value(newValue) {
            setter(newValue);
        }
    }

    return computed;
}