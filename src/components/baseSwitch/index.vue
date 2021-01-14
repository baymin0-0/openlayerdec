<!--
 * @Author: your name
 * @Date: 2021-01-13 16:42:54
 * @LastEditTime: 2021-01-14 13:38:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\baseSwitch\index.vue
-->
<template>
  <!-- 底图切换 -->
  <div id="baseSwitch" v-show="ifShow">
    <!-- 默认底图为天地矢量图 -->
    <div class="vectorLayer below" ref="vectorLayer" @click="selectVector">
      <div class="tip">天地矢量图</div>
    </div>
    <!-- 默认切换底图为天地影像图 -->
    <div class="imageLayer above" ref="imageLayer" @click="selectImage">
      <div class="tip">天地影像图</div>
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
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class BaseSwitch extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  private ifShow: boolean = false;
  public road_layer: any = null;
  public satellite_layer: any = null;
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}
  mounted() {
    this.$bus.$on("showFeaturesKit", (newVal) => {
      this.ifShow = newVal;
    });
    this.initBaseLayer();
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  private initBaseLayer(): void {
    // 初始默认地图
    this.satellite_layer = new TileLayer({
      title: "天地图卫星影像",
      zIndex: -1,
      source: new XYZ({
          url: 'https://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=9a02b3cdd29cd346de4df04229797710'
      })
    });  
    this.road_layer = new TileLayer({
      title: "默认地图",
      zIndex: -1,
      source: new OSM()
    });
  }

  private selectImage(): void {
    // 选中卫星图
    this.$refs.imageLayer.classList.add("above");
    this.$refs.imageLayer.classList.remove("below");
    this.$refs.vectorLayer.classList.remove("above");
    this.$refs.vectorLayer.classList.add("below");
    if (this.$parent.mapLayer == this.road_layer) {
      this.$parent.map.removeLayer(this.road_layer);
      this.$parent.map.addLayer(this.satellite_layer);
      this.$parent.mapLayer = this.satellite_layer;
    }
  }

  private selectVector(): void {
    // 选中矢量图
    this.$refs.vectorLayer.classList.add("above");
    this.$refs.vectorLayer.classList.remove("below");
    this.$refs.imageLayer.classList.remove("above");
    this.$refs.imageLayer.classList.add("below");
    if (this.$parent.mapLayer == this.satellite_layer) {
      this.$parent.map.removeLayer(this.satellite_layer);
      this.$parent.map.addLayer(this.road_layer);
      this.$parent.mapLayer = this.road_layer;
    }
  }
}
</script>

<style lang='stylus' scoped>
@keyframes fadeOut
    from
      opacity 0
      transform translate(0, -200%) //往左移动自身宽的50%,往上移动自身高的200%
    to
      opacity .9
      transform translate(0, 0) //往左移动自身宽的50%,往上移动自身高的0%
  #baseSwitch
    position fixed
    left 10px
    bottom 100px
    z-index 3
    height auto
    width auto
    display flex
    flex-direction row
    animation fadeOut 1s ease forwards
    .vectorLayer
      position fixed
      z-index 4
      width 150px
      height 80px
      display flex
      flex-direction row
      align-items flex-end
      border 2px solid #FFFFFF
      box-shadow 0 0 4px #FFFFFF
      border-radius 10px
      cursor pointer
      background-color #FFFFFF
      background-image url(../../assets/Icons/tiandishiliang.png)
      background-repeat no-repeat
      background-size cover
      transition: left 1s
      .tip
        position absolute
        z-index 5
        opacity .6
        width 100%
        height 20px
        border-radius 5px
        background-color #FFFFFF
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 20px
        color #2C3E50
    .vectorLayer:hover
      border 2px solid #41A97F
      .tip
        background-color #41A97F
        color #FFFFFF
    .vectorLayer.below
      left 50px
      z-index 3
    .vectorLayer.below:hover
      left 140px
    .vectorLayer.above
      left 10px
      z-index 4
      border 2px solid #41A97F
      box-shadow 0 0 4px #41A97F
      .tip
        background-color #41A97F
        color #FFFFFF
    .imageLayer
      position fixed
      z-index 3
      width 150px
      height 80px
      display flex
      flex-direction row
      align-items flex-end
      border 2px solid #FFFFFF
      box-shadow 0 0 4px #FFFFFF
      border-radius 10px
      cursor pointer
      background-color #2C3E50
      background-image url(../../assets/Icons/tiandiyingxiang.png)
      background-repeat no-repeat
      background-size cover
      left 50px
      transition: left 1s
      .tip
        position absolute
        z-index 5
        opacity .6
        width 100%
        height 20px
        border-radius 5px
        background-color #FFFFFF
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 20px
        color #2C3E50
    .imageLayer:hover
      border 2px solid #41A97F
      .tip
        background-color #41A97F
        color #FFFFFF
    .imageLayer.below
      left 50px
      z-index 3
    .imageLayer.below:hover
      left 140px
    .imageLayer.above
      left 10px
      z-index 4
      border 2px solid #41A97F
      box-shadow 0 0 4px #41A97F
      .tip
        background-color #41A97F
        color #FFFFFF
</style>