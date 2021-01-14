/*
 * @Author: your name
 * @Date: 2020-12-17 11:06:39
 * @LastEditTime: 2021-01-14 09:51:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tsdemo\src\router\index.ts
 */
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue')
  },
  {
    path: '/home',
    name: 'Container',
    component: () => import(/* webpackChunkName: "home" */ '@/views/home/index.vue')
  }
]

const router = new VueRouter({routes})

export default router