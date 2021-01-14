<!--
 * @Author: your name
 * @Date: 2021-01-13 11:27:42
 * @LastEditTime: 2021-01-14 13:37:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\views\home\index.vue
-->
<template>
  <div id="map" ref="root">
    <!-- 底图切换 -->
    <base-switch ref="baseSwitch"></base-switch>
    <!-- 控件设置 -->
    <controller ref="controller"></controller>
    <!-- 要素设置 -->
    <!-- <featurekit ref="featurekit"></featurekit> -->
    <features-kit ref="featuresKit"></features-kit>
    <!-- 图层设置 -->
    <layer-set-box :layerList="layerList"></layer-set-box>
    <!-- wfs要素增删改查以及自动化分割与指定数目分割 (没法加载bug)-->
    <wfs-feature ref="wfsFeature"></wfs-feature>
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
import { Map, View } from "ol";
import OSM from "ol/source/OSM";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Stroke } from "ol/style";
import TileLayer from "ol/layer/Tile";
import baseSwitch from '@/components/baseSwitch/index.vue';
import controller from '@/components/controller/index.vue';
import featuresKit from '@/components/featuresKit/index.vue';
import layerSetBox from '@/components/layerSetBox/index.vue';
import wfsFeature from '@/components/wfsFeature/index.vue';
import geojsonData from "@/utils/geojsonData.ts";
@Component({
  // 注册组件
  components: {
    baseSwitch,
    controller,
    featuresKit,
    layerSetBox,
    wfsFeature
  },
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class Container extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  public map: any = null;
  public mapView: any = new View({
    projection: "EPSG:4326",
    center: [113.36617868236259, 22.013946065413293], // 坐标珠海
    zoom: 12, // 当前缩放层级
  });
  public mapLayer: any = null;
  public mapSource: any = new OSM(); // map图层源
  public wfsVectorSource: any = null; // 矢量源
  public wfsVectorLayer: any = null; // 矢量层
  public wfsFeatures: Array<any> = []; // 记录wfs要素
  public drawFeatures: Array<any> = []; // 记录绘制要素
  public drawSource: any = null; // 绘制源
  public drawLayer: any = null; // 绘制层
  public operateFeature: any = null; // 当前操作要素
  // 图层设置列表
  private layerList: any = [
    {
      id: 1,
      isActive: false,
      name: "遥感影像地图及重点区域监测变化图", //一级项名称
      items: [
        //二级项
        {
          id: 1,
          type: "geojson",
          name: "重点区域监测变化图",
          isActive: false,
          geojson: geojsonData.geojson_1,
          layer: null,
        },
      ],
    },
    {
      id: 2,
      isActive: false,
      name: "遥感影像地图及重点区域监测变化图", //一级项名称
      items: [
        //二级项
        {
          id: 1,
          type: "geojson",
          name: "重点区域监测变化图",
          isActive: false,
          geojson: geojsonData.geojson_2,
          layer: null,
        },
      ],
    },
    {
      id: 3,
      isActive: false,
      name: "监测区域遥感影像图及新建楼盘顶层屋面专题图", //一级项名称
      items: [
        //二级项
        {
          id: 1,
          type: "geojson",
          name: "新建楼盘顶层屋面专题图",
          isActive: false,
          geojson: geojsonData.geojson_4,
          layer: null,
        },
      ],
    },
  ];
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}
  @Watch("wfsVectorLayer")
  watchWfsVectorLayer(newVal: any, oldVal: any) {
    this.$refs.wfsFeature.feature = null;
    this.$refs.wfsFeature.decomposeCoordinates = [];
    this.$refs.wfsFeature.decomposeFeatures = [];
  }
  @Watch("operateFeature")
  watchOperateFeature(newVal: any, oldVal: any) {
    console.log("当前点击的要素=>", newVal);
    console.log("无控件开启=>",this.$refs.controller.noneControlOpen)
    // 当前点击要素为非空且无控件开启
    if (this.$refs.controller.noneControlOpen && !!newVal) {
      // 将当前点击的wfs设置新样式
      let style: any = newVal.getStyle();
      style.setStroke(
        new Stroke({ color: "#d81e06", width: 2, lineDash: [5, 5] })
      );
      newVal.setStyle(style);
      this.wfsVectorSource.forEachFeature((feature) => {
        if (feature != newVal) {
          let style: any = feature.getStyle();
          style.setStroke(new Stroke({ color: "#42B983", width: 2 }));
          feature.setStyle(style);
        }
      });
      this.$bus.$emit("feature", newVal);
    } else {
      this.$bus.$emit("feature", null);
      // 将wfs要素要素全部还原
      this.wfsVectorSource.forEachFeature((wfsFeature) => {
        let style = wfsFeature.getStyle();
        style.setStroke(new Stroke({ color: "#42B983", width: 2 }));
        wfsFeature.setStyle(style);
      });
    }
  }
  mounted() {
    if (this.$getLocalStorage("userInfo")) {
        this.initMap()
        this.initMapListener()
    } else {
      this.$router.push("/");
    }
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  private initMap(): void {
    // 初始地图
    this.mapLayer = this.$refs.baseSwitch.satellite_layer;
    // this.mapLayer = new TileLayer({source: new OSM()});
    this.drawSource = new VectorSource({ wrapX: false });
    this.drawLayer = new VectorLayer({ zIndex: 3, source: this.drawSource });
    this.wfsVectorSource = new VectorSource({ wrapX: false });
    this.wfsVectorLayer = new VectorLayer({
      zIndex: 3,
      opacity: 0.8,
      source: this.wfsVectorSource,
    });
    this.map = new Map({
      target: "map",
      layers: [this.mapLayer, this.drawLayer, this.wfsVectorLayer],
      view: this.mapView,
      controls: [],
    });
  }

  private initMapListener(): void {
    // 初始地图监听
    let _this = this;
    this.map.on("click", function (event) {
      // 点击时获取像素区域
      let pixel = _this.map.getEventPixel(event.originalEvent);
      // 像素区域是否存在Feature(要素),是则激活回调函数
      let feature = _this.map.forEachFeatureAtPixel(
        pixel,
        function (feature, layer) {
          return feature;
        }
      );
      // 点击的要素
      if (feature) {
        _this.operateFeature = feature;
        // console.log("当前点击的要素=>", _this.operateFeature);
      } else {
        // 不存在要素
        _this.operateFeature = null;
      }
    });
  }
}
</script>

<style lang='stylus' scoped>
#map 
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 2;
  cursor: url('../../assets/Icons/satellite.png'), default;

</style>