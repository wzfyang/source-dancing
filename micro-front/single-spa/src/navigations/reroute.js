import { started } from "../start";
import { getAppChanges } from "../applications/app";
import { toLoadPromise } from "../lifecycles/load";
import { toUnmountPromise } from "../lifecycles/unmount";
import { toBootstrapPromise } from "../lifecycles/bootstrap";
import { toMountPromise } from "../lifecycles/mount";

import './navigator-events'

export function reroute() {

    const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges();

    if (started) {

        return performAppChanges();
    } else {

        return loadApps();
    }

    async function loadApps() {
        let apps = await Promise.all(appsToLoad.map(toLoadPromise));
    }

    async function performAppChanges() {
        // 先卸载应用
        let unmountPromises = appsToUnmount.map(toUnmountPromise);

        appsToLoad.map(async (app) => {
            app = await toLoadPromise(app);
            app = await toBootstrapPromise(app);
            return toMountPromise(app);;
        })

        appsToMount.map(async (app) => {
            app = await toBootstrapPromise(app);
            return toMountPromise(app);
        })
    }
}

