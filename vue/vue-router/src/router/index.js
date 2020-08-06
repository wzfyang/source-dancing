import Vue from 'vue';
// import VueRouter from 'vue-router';
import VueRouter from '../vue-router/index';

import Home from '../views/home';
import About from '../views/about';

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/about',
        component: About
    }
]

Vue.use(VueRouter);

export default new VueRouter({
    routes
})