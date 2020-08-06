import { NOT_LOADED, shouldBeActive, NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, MOUNTED } from "./app.helpers";
import { reroute } from "../navigations/reroute";


const apps = [];
export function registerApplication(appName, loadApp, activeWhen, customProps) {
    apps.push({
        appName,
        loadApp,
        activeWhen,
        customProps,
        status: NOT_LOADED
    })

    reroute();
}

export function getAppChanges() {
    const appsToLoad = [];
    const appsToMount = [];
    const appsToUnmount = [];

    apps.forEach(app => {
        const shouldActive = shouldBeActive(app);

        switch (app.status) {
            case NOT_LOADED:
            case LOADING_SOURCE_CODE:
                if (shouldActive) {
                    appsToLoad.push(app);
                }
                break;
            case NOT_BOOTSTRAPPED:
            case BOOTSTRAPPING:
            case NOT_MOUNTED:
                if (shouldActive) {
                    appsToMount.push(app);
                }
                break;
            case MOUNTED:
                if (!shouldActive) {
                    appsToUnmount.push(app);
                }
        }
    })

    return {
        appsToLoad,
        appsToMount,
        appsToUnmount
    }
}