<!--
 * @Author: your name
 * @Date: 2021-01-13 11:29:09
 * @LastEditTime: 2021-01-14 13:52:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\featuresKit\index.vue
-->
<template>
  <div id="featurekit" ref="featurekit" v-show="ifShow">
    <!-- 标题 -->
    <div class="title">
      <div class="icon">
        <img src="imgs/setup.png" />
      </div>
      <span>WFS协议设置</span>
    </div>

    <!-- 要素地址 -->
    <div class="address">
      <div class="tip">wfs要素地址:</div>
      <div class="text">
        <input
          type="text"
          placeholder="请输入wfs要素请求URL"
          v-model="wfsURL"
        />
      </div>
    </div>

    <!-- 命名空间URI -->
    <div class="spacename">
      <div class="tip">命名空间uri:</div>
      <div class="text">
        <input
          type="text"
          placeholder="请输入命名空间的uri"
          v-model="spaceURI"
        />
      </div>
      <div class="tip">加载数量:</div>
      <div class="text" style="width: 55px">
        <input type="number" placeholder="请输入" v-model="quantity" />
      </div>
    </div>

    <!-- 工作空间名称与图层名称 -->
    <div class="names">
      <div class="tip">空间名:</div>
      <div class="text">
        <input type="text" placeholder="请输入空间名称" v-model="spaceName" />
      </div>
      <div class="tip">图层名:</div>
      <div class="text">
        <input type="text" placeholder="请输入图层名称" v-model="layerName" />
      </div>
    </div>

    <!-- 投影单选与保存 -->
    <div class="save">
      <div class="select">
        <div class="tip">当前投影:</div>
        <div class="radioes">
          <label>
            <input
              type="radio"
              name="proj"
              v-model="srsName"
              value="EPSG:4326"
            />等矩矩形
          </label>
          <label>
            <input
              type="radio"
              name="proj"
              v-model="srsName"
              value="EPSG:3857"
            />墨卡托
          </label>
        </div>
      </div>
      <div class="confirm" @click.stop="confirm">查询要素</div>
    </div>

    <!-- 查询 -->
    <div class="query" v-show="wfsFeatures.length > 0">
      <div class="select">
        <div class="tip">格式:</div>
        <div class="radioes">
          <label>
            <input
              type="radio"
              name="output"
              v-model="outputType"
              value="SHAPE-ZIP"
            />Shp
          </label>
          <label>
            <input
              type="radio"
              name="output"
              v-model="outputType"
              value="GEOJSON"
            />GeoJSON
          </label>
          <label>
            <input
              type="radio"
              name="output"
              v-model="outputType"
              value="KML"
            />KML
          </label>
          <label>
            <input
              type="radio"
              name="output"
              v-model="outputType"
              value="GML"
            />GML
          </label>
        </div>
      </div>
      <div class="confirm" @click.stop="OutPut">导出要素</div>
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
import { Style, Icon, Stroke, Fill, Text, Circle, Options } from "ol/style";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import GeoJSON from "ol/format/GeoJSON";
import { WFS, filter } from "ol/format";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class Featurekit extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  private ifShow: boolean = false;
  private canQuery: boolean = false;
  private wfsURL: string|null = null;
  private spaceURI: string|null = null;
  private spaceName: string|null = null;
  private layerName: string|null = null;
  private srsName: string = "EPSG:4326";
  private wfsFeatures: Array<any> = [];
  private quantity: any = 5000;
  private outputType: string = "SHAPE-ZIP";
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}

  @Watch("wfsURL")
  watchWfsURL(newVal: any, oldVal: any) {
    newVal == "" ? (this.canQuery = false) : (this.canQuery = true);
  }

  @Watch("spaceURI")
  watchSpaceURI(newVal: any, oldVal: any) {
    newVal == "" ? (this.canQuery = false) : (this.canQuery = true);
  }

  @Watch("spaceName")
  watchSpaceName(newVal: any, oldVal: any) {
    newVal == "" ? (this.canQuery = false) : (this.canQuery = true);
  }

  @Watch("layerName")
  watchLayerName(newVal: any, oldVal: any) {
    newVal == "" ? (this.canQuery = false) : (this.canQuery = true);
  }

  @Watch("quantity")
  watchQuantity(newVal: any, oldVal: any) {
    if (newVal < 0) {
      this.quantity = 0;
    }
  }

  mounted() {
    this.$bus.$on("showFeaturesKit", (newVal) => {
      this.ifShow = newVal;
    });
    this.initByLocalStorage();
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  // 通过本地存储的wfs协议参数自动设置
  private initByLocalStorage(): void {
    this.wfsURL = this.$getLocalStorage("wfsURL");
    this.spaceURI = this.$getLocalStorage("spaceURI");
    this.spaceName = this.$getLocalStorage("spaceName");
    this.layerName = this.$getLocalStorage("layerName");
    this.srsName = this.$getLocalStorage("srsName");
    this.quantity = this.$getLocalStorage("quantity");
    if (!!this.wfsURL && !!this.spaceURI && !!this.spaceName && !!this.layerName) {
      this.canQuery = true;
    }
  }
  // 保存wfs协议参数
  private confirm(): void {
    if (!!this.wfsURL && !!this.spaceURI && !!this.spaceName && !!this.layerName) {
      // 可查询操作
      this.canQuery = true;
      // 设置参数缓存到localStorge中
      this.$setLocalStorage("wfsURL", this.wfsURL);
      this.$setLocalStorage("spaceURI", this.spaceURI);
      this.$setLocalStorage("spaceName", this.spaceName);
      this.$setLocalStorage("layerName", this.layerName);
      this.$setLocalStorage("srsName", this.srsName);
      !this.quantity && (this.quantity = 0);
      this.$setLocalStorage("quantity", parseInt(this.quantity));
    }
    if (this.canQuery) {
      this.Query();
    }
  }
  // 查询wfs要素并添加到指定源上
  private Query(): void {
    let _this = this;
    // 删除原有的geoserver矢量要素
    _this.$parent.wfsVectorSource.clear();
    _this.$parent.wfsFeatures = [];
    _this.wfsFeatures = _this.$parent.wfsFeatures; // 使指针指向同一块内存
    _this.$parent.operateFeatrue = null;
    _this.$bus.$emit("refreshWFSFeatures", true);
    // 创建一个请求
    let featureRequest: any = new WFS().writeGetFeature({
      // 投影规范
      srsName: this.srsName,
      // 注意这个值必须为创建工作区时的命名空间URI
      featureNS: this.spaceURI,
      // 工作区的命名
      featurePrefix: this.spaceName,
      // 所要访问的图层
      featureTypes: [this.layerName],
      // 请求最大数
      maxFeatures: [parseInt(this.quantity)],
      outputFormat: "application/json",
      // 过滤条件
      // filter: new filter.equalTo('name', value)
    });
    // 请求要素
    if(!!this.wfsURL){
      fetch(this.wfsURL, {
        method: "POST",
        body: new XMLSerializer().serializeToString(featureRequest),
      }).then(function (response) {
        return response.json();
      }).then(function (json) {
        console.log(json);
        let features = new GeoJSON({ geometryName: "the_geom" }).readFeatures(
          json
        );
        // 统一为要素设置样式
        features.forEach((feature) => {
          feature.setStyle(
            new Style({
              fill: new Fill({ color: "#FFFFFF" }),
              stroke: new Stroke({ color: "#42B983", width: 2 }),
            })
          );
          _this.$parent.wfsFeatures.push(feature);
        });
        // 重新添加新的矢量要素
        _this.$parent.wfsVectorSource.addFeatures(features);
      });
    }
  }
  private OutPut(): void {
    let url: string =
      this.wfsURL +
      "&request=GetFeature&typeName=" +
      this.spaceName +
      ":" +
      this.layerName +
      "&maxFeatures=" +
      parseInt(this.quantity) +
      "&outputFormat=" +
      this.outputType;
    window.open(url);
  }
}
</script>

<style lang='stylus' scoped>
#featurekit
    top 520px
    left 10px
    height auto
    width 350px
    transition width 0.75s, height 0.75s , border-radius 0.75s
    -moz-transition width 0.75s, height 0.75s,border-radius 0.75s
    -webkit-transition width 0.75s, height 0.75s,border-radius 0.75s
    -o-transition width 0.75s, height 0.75s,border-radius 0.75s
    border-radius 10px
    display flex
    flex-direction column
    border 1px solid #42B983
    box-shadow 0 0 5px #42B983
    background-color #2C3E50
    opacity 0.8
    position fixed
    z-index 3
    animation fadeIn 1s ease forwards
    cursor default
    .title
      width auto
      height 30px
      display flex
      flex-direction row
      justify-content center
      width auto
      color #FFFFFF
      line-height 30px
      font-size 18px
      font-family "新宋体"
      border-bottom 1px solid
      border-image: -webkit-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
      border-image: -moz-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
      border-image: linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
      @keyframes fucks
        from{transition:0.5s ease-in}
        to{transform:rotate(360deg)}
      .icon
        width 25px
        height 25px
        margin-top 2px
        margin-right 5px
        animation-name:fucks;
        animation-duration:2s;
        animation-iteration-count:infinite;
        img
          width 100%
          height 100%
    .address
      width auto
      height 30px
      margin-top 1px
      width auto
      background-color #2C3E50
      border-radius 10px
      display flex
      flex-direction row
      overflow hidden
      .tip
        width 80px
        height 25px
        margin-top 1px
        margin-left 6px
        margin-right 6px
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 26px
        color #FFFFFF
        border-radius 10px
      .text
        width 250px
        height 25px
        margin-top 2px
        border-radius 10px
        overflow hidden
        input
          width 100%
          height 100%
          font-size 12px
          border-radius 10px
          text-align center
          border none
          color #41A97F
    .spacename
      width auto
      height 30px
      margin-top 1px
      width auto
      background-color #2C3E50
      border-radius 10px
      display flex
      flex-direction row
      overflow hidden
      .tip
        width 80px
        height 25px
        margin-top 1px
        margin-left 6px
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 26px
        color #FFFFFF
        border-radius 10px
      .text
        width 115px
        height 25px
        margin-top 2px
        border-radius 10px
        overflow hidden
        input
          width 100%
          height 100%
          font-size 12px
          border-radius 10px
          text-align center
          border none
          color #41A97F
    .names
      width auto
      height 30px
      margin-top 1px
      width auto
      background-color #2C3E50
      border-radius 10px
      display flex
      flex-direction row
      overflow hidden
      .tip
        width 60px
        height 25px
        margin-top 1px
        margin-left 6px
        margin-right 5px
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 26px
        color #FFFFFF
        border-radius 10px
      .text
        width 100px
        height 25px
        margin-top 2px
        border-radius 10px
        overflow hidden
        background-color #2C3E50
        overflow hidden
        input
          width 100%
          height 100%
          font-size 12px
          border-radius 10px
          text-align center
          border none
          color #41A97F
    .save
      width auto
      height 30px
      margin-top 1px
      background-color #2C3E50
      border-radius 10px
      display flex
      flex-direction row
      overflow hidden
      .select
        width 72%
        height 30px
        border-radius 10px
        display flex
        flex-direction row
        .tip
          width 80px
          height 25px
          margin-top 3px
          margin-left 6px
          margin-right 4px
          text-align center
          font-size 12px
          font-family "微软雅黑"
          line-height 26px
          color #FFFFFF
          border-radius 10px
        .radioes
          width 160px
          height 25px
          margin-top 3px
          text-align center
          font-size 12px
          font-family "微软雅黑"
          line-height 26px
          color #FFFFFF
          border-radius 10px
          display flex
          flex-direction row
          justify-content space-around
          align-items center
          label
            display flex
            flex-direction row
            align-items center
      .confirm
        width 26%
        height 25px
        margin-top 2px
        border-radius 10px
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 26px
        color #FFFFFF
        cursor pointer
        background-color #41A97F
    .query
      width auto
      height 30px
      margin-top 1px
      background-color #2C3E50
      border-radius 10px
      display flex
      flex-direction row
      overflow hidden
      .select
        width 75%
        height 30px
        border-radius 10px
        display flex
        flex-direction row
        .tip
          width 65px
          height 25px
          margin-top 3px
          margin-right 6px
          text-align center
          font-size 12px
          font-family "微软雅黑"
          line-height 26px
          color #FFFFFF
          border-radius 10px
        .radioes
          width 160px
          height 25px
          margin-top 3px
          text-align center
          font-size 12px
          font-family "微软雅黑"
          line-height 26px
          color #FFFFFF
          border-radius 10px
          display flex
          flex-direction row
          justify-content space-around
          align-items center
          label
            display flex
            flex-direction row
            align-items center
      .confirm
        width 23%
        height 25px
        margin-top 2px
        border-radius 10px
        text-align center
        font-size 12px
        font-family "微软雅黑"
        line-height 26px
        color #FFFFFF
        cursor pointer
        background-color #41A97F
  @keyframes fadeIn
      from
        opacity 0
        transform translate(-100%, 0) //往左移动自身宽的50%,往上移动自身高的200%
      to
        opacity .8
        transform translate(0, 0) //往左移动自身宽的50%,往上移动自身高的0%
</style>