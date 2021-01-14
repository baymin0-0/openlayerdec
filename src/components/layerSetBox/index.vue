<!--
 * @Author: your name
 * @Date: 2021-01-13 11:29:17
 * @LastEditTime: 2021-01-14 09:50:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\layerSetBox\index.vue
-->
<template>
  <div
    id="layerSetBox"
    ref="layerSetBox"
    :class="{ active: layerSetBox.isActive }"
    @mouseenter="changeState(1)"
    @mouseleave="changeState(0)"
  >
    <!-- 图层设置-提示层 -->
    <div class="title" :class="{ active: layerSetBox.isActive }">
      <div class="logo">
        <img
          :src="layerSetBox.logo.default"
          style="width: 100%; height: 100%"
          v-show="!layerSetBox.isActive"
        />
        <img
          :src="layerSetBox.logo.path"
          style="width: 100%; height: 100%"
          v-show="layerSetBox.isActive"
        />
      </div>
      <div class="content">
        <span v-show="layerSetBox.isActive">{{ layerSetBox.title }}</span>
      </div>
      <div class="lock">
        <img
          :src="layerSetBox.lock.path"
          style="width: 100%; height: 100%"
          v-show="layerSetBox.isActive"
          @click.stop="changeLock()"
        />
      </div>
    </div>
    <!-- 图层设置-列表层 -->
    <div class="list" v-for="(item, index) in layerSetBox.list" :key="index">
      <!-- 一级菜单主题 -->
      <div
        class="theme"
        :class="{ active: item.isActive }"
        v-show="layerSetBox.isActive"
        @click="changeList(item.id)"
      >
        <span>{{ item.name }}</span>
      </div>
      <!-- 二级菜单层 -->
      <div
        class="item"
        :class="{ active: it.isActive }"
        v-for="(it, ind) in item.items"
        :key="ind"
        v-show="item.isActive && layerSetBox.isActive"
        @click="changeItem(item.id, ind)"
      >
        <input
          type="checkbox"
          style="margin-right: 10px"
          :checked="it.isActive ? 'checked' : ''"
        />
        <span>{{ it.name }}</span>
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
import { Vector as VectorSource, TileWMS as WMSTileSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill } from "ol/style";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class LayerSetBox extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  @Prop({type: Array,default: []})
  private layerList !: Array<any>;

  private layerSetBox: any = {
    isActive: true,
    logo: {
      default: "imgs/logo.png",
      path: "imgs/overlaying.png",
    },
    title: "图层设置",
    lock: {
      isLock: true,
      path: "imgs/lock-off.png",
    },
    list: this.layerList,
  };

  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}

  @Watch("layerSetBox.isActive")
  watchActive(newVal: any, oldVal: any) {
    this.$bus.$emit("showFeaturesKit", newVal);
  }

  mounted() {
    this.$bus.$emit("showFeaturesKit", this.layerSetBox.isActive);
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  private changeState(state: any): void {
    let that = this;
    if (state == 0) {
      // 若已锁定则不可收回
      if (!this.layerSetBox.lock.isLock) {
        this.layerSetBox.isActive = false;
      }
    } else {
      // //console.log("鼠标移入")
      this.layerSetBox.isActive = true;
    }
  }
  // 改变锁状态
  private changeLock(): void {
    this.layerSetBox.lock.isLock = !this.layerSetBox.lock.isLock;
    if (this.layerSetBox.lock.isLock) {
      // 锁定
      this.layerSetBox.lock.path = "imgs/lock-off.png";
    } else {
      // 开锁
      this.layerSetBox.lock.path = "imgs/lock-up.png";
    }
  }
  // 一级菜单选中
  private changeList(id: any): void {
    let layer: any = this.layerSetBox.list.find((item) => {
      return item.id == id;
    });
    layer.isActive = !layer.isActive;
  }
  // 二级项选中
  private changeItem(listId: any, ind: any): void {
    let _this = this;
    let map: any = this.$parent.map;
    this.layerSetBox.list.forEach((item) => {
      if (item.id == listId) {
        item.items.forEach((it, index) => {
          if (ind == index) {
            it.isActive = !it.isActive;
            if (it.isActive) {
              // 选中状态则展示图层
              _this.toggleLayer(listId, ind);
            } else {
              // 移除所有已设置的图层
              map.removeLayer(it.layer);
            }
          } else {
            if (it.isActive) {
              // 取消选中
              map.removeLayer(it.layer);
              it.isActive = false;
            }
          }
        });
      } else {
        // 全置不选中
        item.items.forEach((itm) => {
          if (itm.isActive) {
            map.removeLayer(itm.layer);
            itm.isActive = false;
          }
        });
      }
    });
  }
  // 切换图层
  private toggleLayer(id: any, index: any): void {
    let _this = this;
    let map: any = this.$parent.map;
    let item: any = this.layerSetBox.list[id - 1].items[index];
    // wms图层源加载
    if (item.type == "wms") {
      // 图层不存在则创建加载
      if (!item.layer) {
        item.layer = new TileLayer({
          visible: true,
          source: new WMSTileSource({
            url: item.url,
            ratio: 1,
            params: {
              SERVICE: "WMS",
              VERSION: "1.1.0",
              REQUEST: "GetMap",
              LAYERS: item.layerName,
              SRS: "EPSG:4326",
              FORMAT: "image/png",
            },
          }),
        });
      }
    }
    // geojson图层要素加载
    if (item.type == "geojson") {
      // 图层不存在则创建加载
      if (!item.layer) {
        item.layer = new VectorLayer({
          opacity: 0.8,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(item.geojson),
          }),
          style: function (feature, resolution) {
            return new Style({
              fill: new Fill({
                //填充
                color: "#42B983",
              }),
              stroke: new Stroke({
                //边线
                color: "#2C3E50",
                width: 2,
              }),
            });
          },
        });
      }
    }
    // 最终将选中的图层加载进map
    map.addLayer(item.layer);
  }
}
</script>

<style lang='stylus' scoped>
  #layerSetBox
    top 90px
    left 10px
    transition width 1s, height 1s , border-radius 1s
    -moz-transition width 1s, height 1s,border-radius 1s
    -webkit-transition width 1s, height 1s,border-radius 1s
    -o-transition width 1s, height 1s,border-radius 1s
    height 50px
    width 50px
    border 1px solid #42B983
    border-radius 50px
    box-shadow 0 0 5px #42B983
    background-color #2C3E50
    opacity 0.8
    position fixed
    flex-direction column
    z-index 3
   // 展开
  #layerSetBox.active
    height 408px
    width 350px
    border-radius 10px
    overflow hidden
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
        cursor pointer
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
        width 100%
        height 18px
        padding-top 6px
        padding-bottom 6px
        padding-left 35px
        font-size 11px
        text-align left
        color rgb(191, 203, 217)
        cursor pointer
        border-radius 10px
        border-bottom 1px solid #3d4c46
        overflow hidden
      .item:hover
        background-color #42B983
      .item.active
        background-color #42B983
</style>