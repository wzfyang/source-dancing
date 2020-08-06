
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

// ------------------------ patch 测试代码---------------------------
import { compileToFunction } from './compile/index.js';
import { patch, createElm } from './vdom/patch';

let vm1 = new Vue({data: {name: 'hello first'}});
let render1 = compileToFunction('<div>{{name}}</div>');
let oldVnode = render1.call(vm1);

let vm2 = new Vue({data: {name: 'hello second'}});
let render2 = compileToFunction('<p>{{name}}</p>');
let newVnode = render2.call(vm2);

let el = createElm(oldVnode);
document.body.appendChild(el);

patch(oldVnode, newVnode);

