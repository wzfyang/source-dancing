
import { initMixin } from './init';
import { renderMixin } from './render';
import { lifecycleMixin } from './lifecycle';
import { initGlobalAPI } from './global-api/index';

function Vue(options) {
    this._init(options);
}

initMixin(Vue); // 定义原型_init, $mount方法
renderMixin(Vue);
lifecycleMixin(Vue);

initGlobalAPI(Vue);

export default Vue;