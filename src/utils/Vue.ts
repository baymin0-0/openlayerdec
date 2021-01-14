/*
 * @Author: your name
 * @Date: 2020-10-29 14:39:50
 * @LastEditTime: 2021-01-14 11:14:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \lucidw_lushm\src\utils\ElementComps.js
 */
import Vue from "vue"

Vue.prototype.$bus = new Vue()
import {
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Button,
    Loading,
    DatePicker,
    CheckboxGroup,
    Checkbox,
    RadioGroup,
    Radio,
} from 'element-ui'


import { 
    NavBar,
    Uploader, 
    Swipe, 
    SwipeItem,
    ImagePreview,
    Search,
    Circle,
    Toast,
    Icon,
    Popup,
    Tabbar, 
    TabbarItem,
    PullRefresh,
    Dialog,
    Overlay,
    Loading as vantLoading,
} from 'vant';

// APP移动端插件
// import Mui from "vue-awesome-mui"

// 注册Element-UI组件库
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Button)
Vue.use(Loading)
Vue.use(DatePicker)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(RadioGroup)
Vue.use(Radio)

// 注册Vant组件库
Vue.use(NavBar);
Vue.use(Uploader)
Vue.use(Swipe)
Vue.use(SwipeItem)
Vue.use(Search)
Vue.use(Circle)
Vue.use(Icon)
Vue.use(Popup)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(PullRefresh)
Vue.use(Overlay)
Vue.use(vantLoading)
Vue.prototype.$ImagePreview = ImagePreview
Vue.prototype.$Toast = Toast
Vue.prototype.$Dialog = Dialog

// 注册移动端插件
// Vue.use(Mui)
// 本地存储函数封装
Vue.prototype.$setLocalStorage = function(key:any,value:any){
    if(window.localStorage){
      localStorage.setItem(key,value)
    }else{
      alert('This browser does NOT support localStorage')
    }
  }
  Vue.prototype.$getLocalStorage = function(key:any){
    if(window.localStorage){
      const value = localStorage.getItem(key)
      return value ? value : null
    }else{
      alert('This browser does NOT support localStorage')
    }
  }
  Vue.prototype.$removeLocalStorage = function(key:any){
    if(window.localStorage){
      localStorage.removeItem(key)
    }else{
      alert('This browser does NOT support localStorage')
    }
  }
  Vue.prototype.$setSessionStorage = function(key:any,value:any){
    if(window.sessionStorage ){
      sessionStorage .setItem(key,value)
    }else{
      alert('This browser does NOT support sessionStorage ')
    }
  }
  Vue.prototype.$getSessionStorage = function(key:any){
    if(window.sessionStorage){
      const value = sessionStorage.getItem(key)
      return value ? value : null
    }else{
      alert('This browser does NOT support sessionStorage')
    }
  }
  Vue.prototype.$removeSessionStorage = function(key:any){
    if(window.sessionStorage){
      sessionStorage.removeItem(key)
    }else{
      alert('This browser does NOT support sessionStorage')
    }
  }

export default Vue