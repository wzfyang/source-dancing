// 描述应用生命周期

export const NOT_LOADED = 'NOT_LOADED';  // 应用初始状态
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE';  // 加载资源中
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';  // 还未调用bootstrap方法
export const BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动中
export const NOT_MOUNTED = 'NOT_MOUNTED';   // 还未调用mount方法挂载
export const MOUNTING = 'MOUNTING';     // 挂载中
export const MOUNTED = 'MOUNTED';       // 已挂载
export const UPDATING = 'UPDATING';     // 更新中
export const UNMOUNTING = 'UNMOUNTING'; // 卸载中
export const UNLOADING = 'UNLOADING';   // 完全卸载中
export const LOAD_ERR = 'LOAD_ERR';     // load错误
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';


export function isActive(app) {
    return app.status === MOUNTED;
}

export function shouldBeActive(app) {
    return app.activeWhen(window.location);
}