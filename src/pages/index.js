import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Vue from 'vue';

import Demo from './demo/DemoApp';

// 错误信息统计
Vue.config.errorHandler = function (err, vm, info) {
    if (window.Raven) {
        window.Raven.captureException(err);
        window.Raven.captureMessage('Vue运行时错误', {
            level: 'error'
        });
        throw new Error(err);
    }
};
const Main = Vue.component('app', Demo);
/* eslint-disable no-unused-vars */
const main = new Main({
    el: '#app'
});
/* eslint-disable no-unused-vars */

// 调试模块
window.mainApp = main;
