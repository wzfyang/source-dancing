
class VueRouter {
    constructor(routes) {
        console.log(routes);
    }
}
let _Vue;
VueRouter.install = function(Vue) {

    _Vue = Vue;

    Vue.component('router-link', {
    render: h => <a>{this.$slot.default}</a>
    });
    Vue.component('router-view', {
        render: h => <div></div>
    })
}

export default VueRouter;