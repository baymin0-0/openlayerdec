<!--
 * @Author: your name
 * @Date: 2020-12-17 10:13:25
 * @LastEditTime: 2020-12-17 14:31:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tsdemo\src\views\index\child.vue
-->
<template>
  <div id="Child">
    <button @click.stop="myClick1">更改孩子姓名</button>
    <button @click.stop="myClick2">更改孩子年龄</button>
    <div>孩子的父亲名为{{fatherName}}</div>
    <div>输入孩子的姓名:<input type="text" v-model="name" /></div>
    <div>输入孩子的年龄:<input type="number" v-model="age" /></div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
// 使用注解声明为Vue组件
@Component
export default class Child extends Vue {
  // !强制解释,告诉ts编译器该变量一定有值
  @Prop() 
  private fatherName!: string;
  
  @Prop({default: "noFather"})
  @Prop([String,Boolean])
  private hasFather!: boolean | string;
  
  private name: string = "";
  private age: number = 0
  mounted(){
    console.log("hasFather",this.hasFather)
  }
  
  // methods方法
  myClick1() {
    console.log("点击了1");
    console.log("$message=>",this.$message);
    // 对父组件通讯
    this.$emit("childNameMes", this.name);
  }
  // 使用注解进行对父组件通讯
  @Emit("childAgeMes") // childAgeMes则为父组件绑定的函数名
  myClick2() {
    console.log("点击了2");
    return this.age;
  }
}
</script>
<style lang="stylus" scoped>
  #Child{
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>