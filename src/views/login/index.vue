<!--
 * @Author: your name
 * @Date: 2021-01-13 11:27:32
 * @LastEditTime: 2021-01-14 13:25:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\views\login\index.vue
-->
<template>
  <div id="Login">
    <div class="loginbox">
      <div class="title">{{ title }}</div>
      <div class="content">
        <div class="account">
          <img :src="require('@/assets/Icons/account.png')" />
          <input type="text" placeholder="请输入账号" v-model="account" />
        </div>
        <div class="password">
          <img :src="require('@/assets/Icons/lock.png')" />
          <input
            ref="password"
            type="password"
            placeholder="请输入密码"
            v-model="password"
          />
          <img
            :src="showPass ? require('@/assets/Icons/openEyes.png') : require('@/assets/Icons/closeEyes.png')"
            @click="switchPassword"
            style="
              width: 25px;
              height: 25px;
              margin-right: 15px;
              margin-top: 7px;
              margin-left: 10px;
              cursor: pointer;
            "
          />
        </div>
      </div>
      <div class="btn" @click="loginSubmit">
        <input type="button" value="登录" />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */
import {
  Component,
  Emit,
  Inject,
  Model,
  Prop,
  Provide,
  Vue,
  Watch,
} from "vue-property-decorator";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class Login extends Vue {
  public $parent!: any;
  public $refs!: any
  // 响应数据自定义
  private title: string = "openlayer要素管理系统欢迎您的登录"
  private showPass: boolean = false
  private account: string = ""
  private password: string = ""
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}
  mounted() {
      document.addEventListener('keydown',this.loginSubmit)
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  private switchPassword():void{
      this.showPass = !this.showPass
      if(this.showPass){
        this.$refs.password.setAttribute("type","text")
      }else{
        this.$refs.password.setAttribute("type","password")
      }
  }
  private loginSubmit():void{
    if(this.account === "admin" && this.password === "admin"){
        this.$router.push('/home') // 跳转到首页
        this.$setLocalStorage("userInfo",{
            account: this.account,
            password: this.password
        })
    }else{
        this.$setLocalStorage("userInfo",null)
    }
  }
}
</script>

<style lang='stylus' scoped>
#Login
    position absolute
    top 0px
    left 0px
    right 0px
    bottom 0px
    width 100%
    height 100%
    background-image url(../../assets/Icons/global.png)
    background-repeat no-repeat
    background-size cover
    align-items center
    display flex
    flex-direction row
    justify-content center
    cursor url("../../assets/Icons/satellite.png"),default
    .loginbox
      z-index 2
      width 600px
      height 400px
      margin 0 auto
      box-shadow 0 0 20px #42B983
      background-color #2C3E50
      border 2px solid #42B983
      border-radius 8px
      display flex
      flex-direction column
      animation fadeIn 1s ease forwards
      .title
        width 75%
        height 40px
        margin 0 auto
        text-align center
        font-size 18px
        font-family "微软雅黑"
        font-weight 800
        color #FFFFFF
        line-height 35px
        cursor default
        box-shadow 0 0 5px #42B983
        background-color #41A97F
        border-bottom-left-radius 15px
        border-bottom-right-radius 15px
      .content
        width 85%
        height auto
        margin 25px auto
        align-items center
        display flex
        flex-direction column
        border-radius 5px
        .account,.password
          width 75%
          height 40px
          background-color #FFFFFF
          margin 35px auto
          box-shadow 0 0 2px #42B983 inset
          border-radius 25px
          display flex
          flex-direction row
        .account > img,.password > img
          width 42px
          height 100%
        .account > input,.password > input
          width 75%
          height auto
          border-radius 25px
          text-align center
          border none
          outline none
        .account > input:focus,.password > input:focus
          border none
      .btn
        width 50%
        height 40px
        margin 0 auto
        border-radius 25px
        box-shadow 0 0 6px #42B983
        background-color #41A97F
        overflow hidden
        input
          width 100%
          height 100%
          background-color #41A97F
          border-radius 25px
          cursor pointer
          font-size 18px
          font-family "微软雅黑"
          color #FFFFFF
          text-align center
          border none
      @keyframes fadeIn
          from
            opacity 0
            transform translate(0, 100%) //往左移动自身宽的50%,往上移动自身高的200%
          to
            opacity .8
            transform translate(0, 0) //往左移动自身宽的50%,往上移动自身高的0%
</style>