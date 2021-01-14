/*
 * @Author: Jenkins
 * @Date: 2020-12-17 11:06:39
 * @LastEditTime: 2021-01-13 16:33:03
 * @LastEditors: Please set LastEditors
 * @Description: 主要为项目内所有的 vue 文件做模块声明,其次可声明Vue的原型链避免ts编译器监测this报错
 * @FilePath: \tsdemo\src\shims-vue.d.ts
 */
declare module '*.vue' {
  import Vue from 'vue'
  declare module "vue/types/vue" { // 声明Vue原型使ts能够识别
    interface Vue { 
        $message: any
        $api: any
        $ImagePreview: any
        $Toast: any
        $Dialog: any
        $utils: any
        $bus: any
        $setLocalStorage: Function
        $getLocalStorage: Function
        $removeLocalStorage: Function
        $setSessionStorage: Function
        $getSessionStorage: Function
        $removeSessionStorage: Function
    }
  }
  export default Vue
}