import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED } from "../applications/app.helpers";

export async function toBootstrapPromise(app) {
    if (app !== NOT_BOOTSTRAPPED) {
        return app;
    }

    app.status = BOOTSTRAPPING;
    app.bootstrap(app.customProps);
    app.status = NOT_MOUNTED;

    return app;
}