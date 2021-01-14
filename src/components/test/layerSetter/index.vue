<!--
 * @Author: your name
 * @Date: 2021-01-12 10:31:13
 * @LastEditTime: 2021-01-13 10:12:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\layerSet\index.vue
-->
<template>
  <div id='layerSet'>
      <!-- 图层设置-->
      <div class="container" :class="{active:layerSet.isActive}" @mouseenter="changeState(1)" @mouseleave="changeState(0)">
        <!-- 图层设置-提示层 -->
        <div class="title" :class="{active:layerSet.isActive}">
          <div class="logo">
            <img :src="layerSet.logo.default" style="width: 100%;height: 100%;" v-show="!layerSet.isActive"/>
            <img :src="layerSet.logo.path" style="width: 100%;height: 100%;" v-show="layerSet.isActive"/>
          </div>
          <div class="content">
            <span v-show="layerSet.isActive">{{layerSet.title}}</span>
          </div>
          <div class="lock">
            <img :src="layerSet.lock.path" style="width: 100%;height: 100%;" v-show="layerSet.isActive"  @click.stop="changeLock()" />
          </div>
        </div>
        <!-- 图层设置-列表层 -->
        <div class="list" v-for="(item,index) in layerSet.list" :key="index">
          <!-- 一级菜单主题 -->
          <div class="theme" :class="{active:item.isActive}" v-show="layerSet.isActive" @click="changeList(item.id)">
            <span >{{item.name}}</span>
          </div>
          <!-- 二级菜单层 -->
          <div class="item" :class="{active:it.isActive}" v-for="(it,ind) in item.items" :key="ind" v-show="item.isActive&&layerSet.isActive" @click="changeItem(item.id,ind)">
            <input type="checkbox" style="margin-right: 10px;" :checked="it.isActive?'checked':''"/>
            <span>{{it.name}}</span>
          </div>
        </div>
      </div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator' 
import TileLayer from "ol/layer/Tile"
import { Vector as VectorSource , TileWMS as WMSTileSource , ImageWMS as WMSImgSource } from "ol/source"
import { Vector as VectorLayer } from "ol/layer"
import GeoJSON from "ol/format/GeoJSON"
import { Style , Icon , Stroke , Fill , Text , Circle , Options } from 'ol/style'
import layerList from "@/utils/layerList.ts"
@Component({
    // 注册组件
    components:{},
    // 传值注入(建议使用注解方式注入)
    // props:{}
})
export default class LayerSetter extends Vue {
    // 定义父组件为Any类型
    public $parent !: any
    @Prop()
    private map: any
    // 响应数据定义
    private layerSet: any = {// 图层设置对象
        isActive: false,
        logo:{
            default: "imgs/logo.png",
            path:"imgs/overlaying.png",
        },
        title:"图层设置",
        lock:{
            isLock: false,
            path:"imgs/lock-up.png",
        },
        list: layerList //列表层内容
    }
    // 生命周期函数定义
    beforeCreate() {}
    created() {}
    beforeMount() {}
    mounted() {}
    beforeUpdate() {}
    updated() {}
    beforeDestroy() {}
    destroyed() {}

    @Watch("layerSet.isActive",{deep: false})
    "layerSet.isActive"(newVal: boolean){
        console.log("layerSet状态=>",newVal)
        // 关闭状态时
        if(!newVal){
            this.layerSet.list.forEach((item) => {
                item.isActive = false
            })
        }
    }

    // methods方法定义
    
    // 未被锁住,鼠标移出移入可改变图层设置DIV
    changeState(state: number): void{
        let that = this
        if(state==0){
            // 若已锁定则不可收回
            if(!this.layerSet.lock.isLock){
                this.layerSet.isActive = false
            }
        }else{
            // console.log("鼠标移入")
            this.layerSet.isActive = true
        }
    }
    // 改变锁状态
    changeLock(): void{
        // 锁状态取反
        this.layerSet.lock.isLock = !this.layerSet.lock.isLock
        if(this.layerSet.lock.isLock){// 锁定
            this.layerSet.lock.path = "imgs/lock-off.png"
        }else{// 开锁
            this.layerSet.lock.path = "imgs/lock-up.png"
        }
    }
    // 改变列表内容
    changeList(id: string): void{
        let layer: any = this.layerSet.list.find((item: any) => {
            return item.id==id
        })
        layer.isActive = !layer.isActive
    }
    // 改变列表项
    changeItem(listId: number,ind: number): void{
        let _this = this
        this.layerSet.list.forEach((item) => {
          if(item.id==listId){
              item.items.forEach((it,index) => {
                  if(ind==index){
                      it.isActive = !it.isActive
                      if(it.isActive){//选中状态则展示图层
                        _this.toggleLayer(listId,ind)
                      }else{// 移除所有已设置的图层
                        _this.map.removeLayer(it.layer)
                      }
                  }else{
                      if(it.isActive){
                        _this.map.removeLayer(it.layer)
                        it.isActive = false
                      }
                  }
              })
          }else{
              item.items.forEach((itm) => {
                  if(itm.isActive){
                      _this.map.removeLayer(itm.layer)
                      itm.isActive = false
                  }
              })
          }
        })
    }
    // 切换图层
    toggleLayer(id: number,index: number): any{
        let _this = this
        // 初始化图层
        if(this.layerSet.list[id-1].items[index].type=="wms"){
          if(!this.layerSet.list[id-1].items[index].layer){
              this.layerSet.list[id-1].items[index].layer = new TileLayer({
                  visible: true,
                  source: new WMSTileSource({
                      url: _this.layerSet.list[id-1].items[index].url,
                      ratio: 1,
                      params: {
                      SERVICE: 'WMS',
                      VERSION: '1.1.0',
                      REQUEST: 'GetMap',
                      LAYERS: _this.layerSet.list[id-1].items[index].layerName,
                      SRS: 'EPSG:4326',
                      FORMAT: 'image/png',
                      }
                  })
              });
          }
        }
        if(this.layerSet.list[id-1].items[index].type=="geojson"){
          // 2019年11月重点区域监测变化图
          if(!this.layerSet.list[id-1].items[index].layer){
              this.layerSet.list[id-1].items[index].layer = new VectorLayer({
                  opacity: 0.8,
                  source: new VectorSource({
                      features: (new GeoJSON()).readFeatures(this.layerSet.list[id-1].items[index].geojson)
                  }),
                  style: function(feature,resolution) {
                      return new Style({
                          fill: new Fill({ //填充
                              color: "#42B983"
                          }),
                          stroke: new Stroke({ //边线
                              color: '#2C3E50',
                              width: 2
                          }),
                      });
                  }
              });
          }
        }
        this.map.addLayer(this.layerSet.list[id-1].items[index].layer) 
    }
}
</script>

<style lang='stylus' scoped>
    #layerSet
      width auto
      height auto
      cursor pointer
      // 收回
      .container
        top 100px
        left 10px
        transition width 0.75s, height 0.75s , border-radius 0.75s
        -moz-transition width 0.75s, height 0.75s,border-radius 0.75s
        -webkit-transition width 0.75s, height 0.75s,border-radius 0.75s
        -o-transition width 0.75s, height 0.75s,border-radius 0.75s
        height 50px
        width 50px
        border 1px solid #42B983
        border-radius 50px
        box-shadow 0 0 5px #42B983
        background-color #2C3E50
        opacity 0.8
        position fixed
        flex-direction column
        z-index 1
       // 展开
      .container.active
        height 408px
        width 350px
        border-radius 10px
        // 标题
        .title
          width 99%
          height 60px
          border-radius 5px
          border-bottom 1px solid #42B983
          display flex
          flex-direction row
          overflow hidden
          // 设置颜色渐变
          border-image: -webkit-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          border-image: -moz-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          border-image: linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          // 标记
          .logo
            width 40px
            height 40px
            margin-top 10px
            margin-left 10px
            border-radius 50px
            overflow hidden
          .content
            width 190px
            height 30px
            padding 5px
            margin-top 12px
            margin-left 10px
            text-align left
            color #FFFFFF
            font-size 18px
            font-family "微软雅黑"
            overflow hidden
          // 锁
          .lock
            width 30px
            height 30px
            border-radius 50px
            margin-top 15px
            margin-left 50px
            overflow hidden
        .list
          display flex
          flex-direction column
          overflow hidden
          .theme
            width 100%
            height 35px
            padding-top 15px
            border-bottom 1px solid #3d4c46
            font-size 12px
            text-align center
            color rgb(191, 203, 217)
            cursor pointer
            overflow hidden
          .theme.active
            border-bottom 1px solid
            border-image: -webkit-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
            border-image: -moz-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
            border-image: linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          .item
            padding-top 6px
            padding-bottom 6px
            padding-left 35px
            font-size 11px
            text-align left
            color rgb(191, 203, 217)
            cursor pointer
            border-radius 10px
            border-bottom 1px solid #3d4c46
          .item:hover
            background-color #42B983
          .item.active
            background-color #42B983
</style>