/*
 * @Author: Jenkins
 * @Date: 2020-12-17 11:06:39
 * @LastEditTime: 2020-12-17 13:30:21
 * @LastEditors: Please set LastEditors
 * @Description:  JSX 语法的全局命名空间
 * @FilePath: \tsdemo\src\shims-tsx.d.ts
 */
import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
