/*
 * @Author: your name
 * @Date: 2020-12-17 11:06:39
 * @LastEditTime: 2021-01-13 16:33:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tsdemo\src\main.ts
 */
import Vue from '@/utils/Vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Api from '@/api/api'
import Utils from '@/api/utils'

Vue.config.productionTip = false
Vue.prototype.$api = Api
Vue.prototype.$message = "Welcome To TypeScript Wolrd!!!"
Vue.prototype.$utils = Utils

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
