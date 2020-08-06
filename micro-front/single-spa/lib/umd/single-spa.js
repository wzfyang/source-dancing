(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

    // 描述应用生命周期

    const NOT_LOADED = 'NOT_LOADED';  // 应用初始状态
    const LOADING_SOURCE_CODE$1 = 'LOADING_SOURCE_CODE';  // 加载资源中
    const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';  // 还未调用bootstrap方法
    const BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动中
    const NOT_MOUNTED = 'NOT_MOUNTED';   // 还未调用mount方法挂载
    const MOUNTING = 'MOUNTING';     // 挂载中
    const MOUNTED = 'MOUNTED';       // 已挂载
    const UNMOUNTING = 'UNMOUNTING'; // 卸载中

    function shouldBeActive(app) {
        return app.activeWhen(window.location);
    }

    let started = false;
    function start() {
        started = true;
        reroute();
    }

    function flattenFnArray(fns) {
        fns = Array.isArray(fns) ? fns : [fns];

        return function(props) {
            // Promise.resolve().then(() => fn1(props)).then(() => fn2(props));
            return (props) => fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
        }
    }
    async function toLoadPromise(app) {
        if (app.loadPromise) {
            return app.loadPromise;
        }

        return app.loadPromise = Promise.resolve().then(async () => {
            app.status = LOADING_SOURCE_CODE$1;
            let { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
            app.status = NOT_BOOTSTRAPPED;
            // 多个promise链式组合
            app.bootstrap = flattenFnArray(bootstrap);
            app.mount = flattenFnArray(mount);
            app.unmount = flattenFnArray(unmount);

            delete app.loadPromise;
            return app;
        })
    }

    async function toUnmountPromise(app) {
        if (app.status !== MOUNTED) {
            return app;
        }

        app.status = UNMOUNTING;
        await app.unmount(app.customProps);
        app.status = NOT_MOUNTED;

        return app;
    }

    async function toBootstrapPromise(app) {
        if (app !== NOT_BOOTSTRAPPED) {
            return app;
        }

        app.status = BOOTSTRAPPING;
        app.bootstrap(app.customProps);
        app.status = NOT_MOUNTED;

        return app;
    }

    async function toMountPromise(app) {
        if (app.status !== NOT_MOUNTED) {
            return app;
        }

        app.status = MOUNTING;
        await app.mount(app.customProps);
        app.status = MOUNTED;

        return app;
    }

    const routingEventsListeningTo = ['hashchange', 'popstate'];

    function urlReroute() {
        reroute();
    }

    const capturedEventListeners = {
        hashchange: [],
        popstate: []
    };

    window.addEventListener('hashchange', urlReroute);
    window.addEventListener('popstate', urlReroute);

    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;

    window.addEventListener = function(eventName, fn) {
        if (routingEventsListeningTo.indexOf(eventName) >= 0 && !capturedEventListeners[eventName].some(listener => listener == fn)) {
            capturedEventListeners[eventName].push(fn);
            return;
        }

        return originalAddEventListener.apply(this, arguments);
    };

    window.removeEventListener = function(eventName, fn) {
        if (routingEventsListeningTo.indexOf(eventName) >= 0) {
            capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(l => l !== fn);
            return;
        }
        return originalRemoveEventListener.apply(this, arguments);
    };

    function patchedUpdateState(updateState, methodName) {
        return function() {
            const urlBefore = window.location.href;
            updateState.apply(this, arguments);
            const urlAfter = window.location.href;

            if (urlBefore !== urlAfter) {
                urlReroute(new PopStateEvent('popstate'));
            }
        }
    }

    window.history.pushState = patchedUpdateState(window.history.pushState);
    window.history.popstate = patchedUpdateState(window.history.popstate);

    function reroute() {

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
                return toMountPromise(app);        });

            appsToMount.map(async (app) => {
                app = await toBootstrapPromise(app);
                return toMountPromise(app);
            });
        }
    }

    const apps = [];
    function registerApplication(appName, loadApp, activeWhen, customProps) {
        apps.push({
            appName,
            loadApp,
            activeWhen,
            customProps,
            status: NOT_LOADED
        });

        reroute();
    }

    function getAppChanges() {
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
        });

        return {
            appsToLoad,
            appsToMount,
            appsToUnmount
        }
    }

    exports.registerApplication = registerApplication;
    exports.start = start;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map
