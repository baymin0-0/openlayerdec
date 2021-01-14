<!--
 * @Author: your name
 * @Date: 2021-01-13 11:29:30
 * @LastEditTime: 2021-01-14 13:46:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\wfsFeature\index.vue
-->
<template>
  <div
    id="wfsFeature"
    v-if="showInfo && feature != null"
    @click.stop="currentIndex = null"
  >
    <!-- 标题 -->
    <div class="title">
      <div class="icon">
        <img :src="require('@/assets/Icons/feature.png')" />
      </div>
      <span>WFS要素设置</span>
    </div>

    <!-- 面板切换 -->
    <div class="naviSwitch">
      <div
        class="navi"
        :class="{ active: item.isActive }"
        v-for="(item, index) in navigates"
        :key="index"
        @click.stop="changeNavi(item.id)"
      >
        {{ item.name }}
      </div>
    </div>

    <!-- 要素信息 -->
    <div class="info" v-show="navigates[0].isActive">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr class="item" v-show="feature.isPolygon">
          <td class="key">
            <input
              type="text"
              value="总面积"
              disabled="disabled"
              style="color: #42b983"
            />
          </td>
          <td class="value">
            <input
              type="text"
              :value="getPolygonArea()"
              disabled="disabled"
              style="color: #42b983"
            />
          </td>
        </tr>
        <tr class="item" v-show="feature.isPolygon || feature.isLineString">
          <td class="key">
            <input
              type="text"
              value="总长度"
              disabled="disabled"
              style="color: #42b983"
            />
          </td>
          <td class="value">
            <input
              type="text"
              :value="feature.isPolygon ? getPolygonTotalLength() : getLineStringLength()"
              disabled="disabled"
              style="color: #42b983"
            />
          </td>
        </tr>
        <!-- 坐标点经纬度信息 -->
        <template v-for="(item, index) in feature.coordinates" >
          <tr class="item" v-for="(itm, ind) in item" :key="index+''+ind">
            <td class="key">
              <input
                type="text"
                :value="ind == 0 ? '经度' + (index + 1) : '纬度' + (index + 1)"
                disabled="disabled"
              />
            </td>
            <td class="value">
              <input type="text" :value="itm" disabled="disabled" />
            </td>
          </tr>
        </template>
      </table>
    </div>

    <!-- 要素编辑 -->
    <div class="edit" v-show="navigates[1].isActive">
      <!-- 分割操作 -->
      <table
        border="0"
        cellpadding="0"
        cellspacing="0"
        v-show="feature.isPolygon"
      >
        <tr height="30px">
          <td width="100%" colspan="2" align="center">要素分解</td>
        </tr>
        <tr height="30px">
          <td width="45%">
            <input
              type="text"
              value="当前已分解数量"
              class="key"
              disabled="disabled"
            />
          </td>
          <td width="55%">
            <input
              type="number"
              class="value"
              :value="decomposeCoordinates.length"
              disabled="disabled"
              style="color: #42b983"
            />
          </td>
        </tr>
        <tr height="30px">
          <td width="45%">
            <input
              type="text"
              value="指定分解数量"
              class="key"
              disabled="disabled"
            />
          </td>
          <td width="55%">
            <input type="number" class="value" v-model="feature.decomposeNum" />
          </td>
        </tr>
        <tr height="30px">
          <td width="100%" colspan="2" align="center">
            <button style="color: #42b983" @click="decomposeFeature(true)">
              按指定分解
            </button>
          </td>
        </tr>
        <tr height="30px">
          <td width="100%" colspan="2" align="center">
            <button style="color: #42b983" @click="decomposeFeature(false)">
              {{ feature.coordinates.length == 3 ? "等分解" : "自动分解" }}
            </button>
          </td>
        </tr>
      </table>

      <!-- 样式编辑 -->
      <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 2px">
        <tr height="30px">
          <td width="100%" colspan="2" align="center">要素样式</td>
        </tr>
        <tr height="30px">
          <td width="45%">
            <input
              type="text"
              value="填充颜色"
              class="key"
              disabled="disabled"
            />
          </td>
          <td width="55%">
            <input type="color" class="value" v-model="feature.fillColor" />
          </td>
        </tr>
        <tr height="30px">
          <td width="100%" colspan="2" align="center">
            <button style="color: #42b983" @click="saveStyle">保存</button>
          </td>
        </tr>
      </table>

      <!-- 属性编辑 -->
      <table
        border="0"
        cellpadding="0"
        cellspacing="0"
        style="margin-top: 2px"
        v-show="feature.properties != null && feature.properties.length > 0"
      >
        <tr height="30px">
          <td width="100%" colspan="2" align="center">要素属性</td>
        </tr>
        <tr height="30px">
          <td width="50%">
            <input
              type="text"
              class="property"
              value="属性名"
              disabled="disabled"
            />
          </td>
          <td width="50%">
            <input
              type="text"
              class="property"
              value="属性值"
              disabled="disabled"
            />
          </td>
        </tr>
        <tr height="30px">
          <td width="50%">
            <input
              type="text"
              class="property"
              value="FeatureID"
              disabled="disabled"
            />
          </td>
          <td width="50%">
            <input
              type="text"
              class="property"
              :value="feature.originFeature.getId()"
              disabled="disabled"
            />
          </td>
        </tr>
        <!-- 遍历部分 -->
        <tr
          height="30px"
          v-for="(property, index) in feature.properties"
          :key="index"
          @click.stop="currentIndex = index"
        >
          <td width="50%">
            <!-- 属性名不能随意更改 -->
            <input
              type="text"
              class="property"
              v-model="property.key"
              disabled="disabled"
            />
          </td>
          <td width="50%">
            <input type="text" class="property" v-model="property.value" />
          </td>
        </tr>
        <!-- 保存所有属性 -->
        <tr height="30px">
          <td width="100%" colspan="2" align="center">
            <button style="color: #42b983" @click="saveProperties">保存</button>
          </td>
        </tr>
      </table>
    </div>

    <!-- 要素保存与删除按钮 -->
    <div class="btns" v-show="navigates[1].isActive">
      <div class="confirm" @click="saveFeature">保存要素</div>
      <div class="delete" @click="deleteFeature">删除要素</div>
    </div>

    <div
      class="upload"
      @click="uploadFeatures"
      v-show="navigates[1].isActive && decomposeFeatures.length > 0"
    >
      上传全部分解要素
    </div>
  </div>
</template>

<script lang="ts">
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
import { Map, View, Feature } from "ol";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import {
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from "ol/geom";
import { Style, Icon, Stroke, Fill, Text, Circle, Options } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import WFS from "ol/format/WFS";
import Decompose from "@/utils/Decompose";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class WfsFeature extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  private navigates: any = [
    {
      id: 0,
      isActive: true,
      name: "要素信息",
    },
    {
      id: 1,
      isActive: false,
      name: "要素编辑",
    },
  ];
  private showInfo: boolean = true;
  private currentIndex: any = null;
  // 要素内容
  public feature: any = null;
  // 存储分解出来的坐标组
  public decomposeCoordinates: Array<any> = [];
  public decomposeFeatures: Array<any> = [];
  public rmOriginalFeatures: Array<any> = [];
  private wfsURL: string = "";
  private spaceURI: string = "";
  private spaceName: string = "";
  private layerName: string = "";
  private srsName: string = "";
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}
  @Watch("showInfo")
  watchShowInfo(newVal: any, oldVal: any) {
    // 控件处于开启状态
    if (!newVal) {
      this.$parent.operateFeatrue = null;
    }
  }
  mounted() {
    // 控件是否都已关闭
    this.$bus.$on("noneControlOpen", (value) => {
      this.showInfo = value;
    });
    this.$bus.$on("removeAllFeatures", (value) => {
      if (value) {
        this.$parent.wfsVectorSource.clear();
        this.$parent.wfsFeatures = [];
        this.$parent.operateFeatrue = null;
        this.rmOriginalFeatures = [];
        this.decomposeFeatures = [];
        this.decomposeCoordinates = [];
      }
    });
    this.$bus.$on("refreshWFSFeatures", (value) => {
      if (value) {
        this.rmOriginalFeatures = [];
        this.decomposeFeatures = [];
        this.decomposeCoordinates = [];
      }
    });
    // 从父组件的地图中获取当前点击的要素信息
    this.$bus.$on("feature", (feature) => {
      console.log("当前点击获取到的要素=>", feature)
      if (feature != null) {
        let newProperties = new Array();
        let properties = feature.getProperties();
        if (properties != null) {
          Object.keys(properties).forEach((key) => {
            if (key != "the_geom" && key != "geometry") {
              newProperties.push({
                key: key,
                value: properties[key],
              });
            }
          });
        }
        // 判断数组维度再设置坐标
        let coordinates,
          level = Decompose.dimensionArr(
            feature.getGeometry().getCoordinates()
          );
        if (level == 4) {
          coordinates = Decompose.deepcopy(
            feature.getGeometry().getCoordinates()[0][0]
          );
        } else if (level == 3) {
          coordinates = Decompose.deepcopy(
            feature.getGeometry().getCoordinates()[0]
          );
        } else if (level == 2) {
          coordinates = Decompose.deepcopy(
            feature.getGeometry().getCoordinates()
          );
        } else {
          coordinates = Decompose.deepcopy([
            feature.getGeometry().getCoordinates(),
          ]);
        }
        let geom = feature.getGeometry();
        // 设置要素信息
        this.feature = {
          decomposeNum: 0,
          coordinates: coordinates,
          properties: newProperties,
          fillColor: feature.getStyle().getFill().getColor(),
          strokeColor: feature.getStyle().getStroke().getColor(),
          originFeature: feature,
          hasDecompose: false,
          isPolygon: geom instanceof Polygon || geom instanceof MultiPolygon ? true : false,
          isLineString: geom instanceof LineString || geom instanceof MultiLineString ? true : false,
        };
        if (
          this.feature.coordinates != null &&
          this.feature.coordinates.length > 0
        ) {
          level >= 3 && this.feature.coordinates.pop();
        }
      } else {
        this.feature = null;
      }
    });
  }
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  // 改变要素面板
  private changeNavi(id: any): void {
    this.navigates.forEach((item) => {
      if (item.id == id) {
        item.isActive = true;
      } else {
        item.isActive = false;
      }
    });
  }
  // 自动分解要素
  private decomposeFeature(specify: any): void {
    // 当前点击要素未曾被分解
    if (!this.feature.hasDecompose) {
      // 分解的是否是geoserver上的要素,若是则添加进待请求删除组上
      if (
        this.$parent.wfsFeatures.findIndex(
          (feature) => feature == this.feature.originFeature
        ) != -1
      ) {
        this.rmOriginalFeatures.push(this.feature.originFeature);
      }
      // 先将当前要素坐标拷贝一份
      let coordinates = Decompose.deepcopy(this.feature.coordinates);
      let dep = new Decompose(coordinates);
      if (specify) {
        // 按指定分解
        if (this.feature.decomposeNum > 0) {
          let triangles: Array<any> | undefined = dep.specifyDecompose(
            this.feature.decomposeNum
          );
          // console.log(triangles)
          if (triangles) {
            triangles.forEach((item) => {
              // 将分解的坐标组存储
              this.decomposeCoordinates.push(item);
            });
          }
          this.feature.hasDecompose = true;
          this.showDecomposeFeatures();
          // 先从地图上移除被分解要素
          this.$parent.wfsVectorSource.removeFeature(
            this.feature.originFeature
          );
        }
      } else {
        // 自动分解
        if (coordinates.length > 3) {
          // 多边形分解
          let triangles = dep.decomposeToTriangles();
          triangles.forEach((item) => {
            // 将分解的坐标组存储
            this.decomposeCoordinates.push(item);
          });
          // 先从地图上移除被分解要素
          this.$parent.wfsVectorSource.removeFeature(
            this.feature.originFeature
          );
        } else if (coordinates.length == 3) {
          // 是否是当前分解坐标组里的坐标组
          let oldIndex = this.decomposeCoordinates.findIndex(
            (item) => item.toString() == coordinates.toString()
          );
          // 是则先移除该坐标组
          oldIndex != -1 && this.decomposeCoordinates.splice(oldIndex, 1);
          // 三角形等分解
          let triangles = dep.powDecomposeTriangles([coordinates], 1);
          triangles.forEach((item) => {
            // 在原索引位置上添加分解的新坐标组
            oldIndex != -1
              ? this.decomposeCoordinates.splice(oldIndex, 0, item)
              : this.decomposeCoordinates.push(item);
          });
          // 先从地图上移除被分解要素
          this.$parent.wfsVectorSource.removeFeature(
            this.feature.originFeature
          );
        }
        this.feature.hasDecompose = true;
        this.showDecomposeFeatures();
        this.$parent.operateFeatrue = null;
      }
    }
  }
  // 显示分解要素
  private showDecomposeFeatures(): void {
    console.log("原来的分解要素集合=>", this.decomposeFeatures);
    console.log("原来的要素坐标组=>", this.decomposeCoordinates);
    // 将原来的分解要素移除
    this.decomposeFeatures.forEach((feature) => {
      if (this.$parent.wfsVectorSource.hasFeature(feature)) {
        this.$parent.wfsVectorSource.removeFeature(feature);
      }
    });
    // 重新构造要素
    this.decomposeFeatures = [];
    this.decomposeCoordinates.forEach((coordinates, index) => {
      let newCoordinates = Decompose.reductCoordinates(coordinates);
      console.log("新要素坐标=>", newCoordinates);
      let feature = new Feature({
        geometry: new Polygon([newCoordinates]),
      });
      feature.setGeometry(
        new MultiPolygon([feature.getGeometry().getCoordinates(false)])
      );
      // 为分解要素添加默认显示样式
      feature.setStyle(
        new Style({
          fill: new Fill({
            color: "#2c2c2c",
          }),
          stroke: new Stroke({
            color: "#42B983",
            width: 2,
          }),
        })
      );
      // 放置到wfs层源
      this.$parent.wfsVectorSource.addFeature(feature);
      this.decomposeFeatures.push(feature);
    });
  }
  // 保存当前要素的样式
  private saveStyle(): void {
    let style: any = this.feature.originFeature.getStyle();
    style.setFill(
      new Fill({
        color: this.feature.fillColor,
      })
    );
    this.feature.originFeature.setStyle(style);
  }
  // 保存当前要素的属性
  private saveProperties(): void {
    this.feature.properties.forEach((property) => {
      this.feature.originFeature.set(property.key, property.value);
    });
    // 如果是geoserver上的要素则发起修改请求
    if (
      this.$parent.wfsFeatures.findIndex(
        (feature) => feature == this.feature.originFeature
      ) != -1
    ) {
      let wfsFeature: any = this.feature.originFeature.clone();
      wfsFeature.setId(this.feature.originFeature.getId());
      this.submit(null, [wfsFeature], null);
    }
  }
  // 保存当前要素
  private saveFeature(): void {
    let index: number = this.$parent.wfsFeatures.findIndex(
      (feature) => feature == this.feature.originFeature
    );
    // let index = -1 // 可以用作图层要素迁移
    // 保存的要素不在geoserver上
    if (index == -1) {
      console.log("开始上传到geoserver");
      this.$parent.wfsVectorSource.removeFeature(this.feature.originFeature);
      this.submit([this.feature.originFeature], null, null);
    } else {
      // 保存的要素在geoserver上
      console.log("开始更新到geoserver");
      this.saveProperties();
    }
  }
  // 删除当前要素
  private deleteFeature(): void {
    // 判断当前要素是否是geoserver上的要素,是则从geoserver上删除
    this.$parent.wfsFeatures.findIndex(
      (feature) => feature == this.feature.originFeature
    ) != -1 && this.submit(null, null, [this.feature.originFeature]);
    // 移除本地数据
    this.$parent.wfsVectorSource.removeFeature(this.feature.originFeature);
    this.feature = null;
  }
  // 上传分解要素
  private uploadFeatures(): void {
    // 移除原geoserver上的被分解要素
    this.submit(null, null, this.rmOriginalFeatures);
    this.rmOriginalFeatures = [];
    // 添加新上传的分解要素
    this.submit(this.decomposeFeatures, null, null);
    this.decomposeFeatures.forEach((feature) => {
      this.$parent.wfsVectorSource.removeFeature(feature);
    });
    this.decomposeFeatures.findIndex(
      (feature) => feature == this.feature.originFeature
    ) != -1 && (this.feature = null);
    this.decomposeFeatures = [];
    this.decomposeCoordinates = [];
    this.feature = null;
  }
  // WFS增删改查
  private submit(newFeatures: any, modFeatures: any, delFeatures: any): void {
    let _this = this;
    // 转换要素里的坐标
    newFeatures != null && (newFeatures = this.reverCoordinates(newFeatures));
    modFeatures != null && (modFeatures = this.reverCoordinates(modFeatures));
    delFeatures != null && (delFeatures = this.reverCoordinates(delFeatures));
    // 获取要素设置信息
    this.wfsURL = this.$parent.$refs.featuresKit.wfsURL;
    this.spaceURI = this.$parent.$refs.featuresKit.spaceURI;
    this.spaceName = this.$parent.$refs.featuresKit.spaceName;
    this.layerName = this.$parent.$refs.featuresKit.layerName;
    this.srsName = this.$parent.$refs.featuresKit.srsName;
    let WFSTSerializer = new WFS();
    // 参数一为要插入的功能,参数二为要更新的功能,参数三为要删除的功能
    let featObject = WFSTSerializer.writeTransaction(
      newFeatures,
      modFeatures,
      delFeatures,
      {
        featureNS: _this.spaceURI, // 注意这个值必须为创建工作区时的命名空间URI
        featurePrefix: _this.spaceName, //工作空间名称
        featureType: _this.layerName, //图层名称
        srsName: _this.srsName, //投影规范
      }
    );
    // 转换为xml内容发送到服务器端
    let serializer = new XMLSerializer();
    let featString = serializer.serializeToString(featObject);
    // 全局geometry字段替换
    featString = featString.replace(new RegExp("geometry", "g"), "the_geom");
    console.log("上传的xml内容=>", featString);
    let request = new XMLHttpRequest();
    request.open("POST", this.wfsURL);
    // 指定内容为xml类型
    request.setRequestHeader("Content-Type", "text/xml");
    request.send(featString);
  }
  // 反转要素的经纬度坐标以符合wfs协议中经纬度的位置
  private reverCoordinates(Features: any): any {
    Features.forEach((wfsFeature) => {
      let geom = wfsFeature.get("the_geom")
        ? wfsFeature.get("the_geom")
        : wfsFeature.get("geometry");
      geom.applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
        for (let j = 0; j < flatCoordinates.length; j += stride) {
          let y = flatCoordinates[j];
          let x = flatCoordinates[j + 1];
          flatCoordinates[j] = x;
          flatCoordinates[j + 1] = y;
        }
      });
    });
    return Features;
  }
  private getPolygonArea(): string {
    return (
      Decompose.getPolygonArea(Decompose.getPolygon(this.feature.coordinates)) +
      "㎡"
    );
  }
  private getPolygonTotalLength(): string {
    let newCoordinates = Decompose.deepcopy(this.feature.coordinates);
    if (
      newCoordinates[0].toString() !=
      newCoordinates[newCoordinates.length - 1].toString()
    ) {
      newCoordinates.push(newCoordinates[0]);
    }
    return this.getLineStringLength();
  }
  private getLineStringLength(): string {
    let coordinates = this.feature.coordinates;
    let sumLength = 0;
    for (let i = 0; i < coordinates.length; i++) {
      for (let j = i + 1; j < coordinates.length; j++) {
        sumLength += Decompose.getLineLen(
          Decompose.getEdgeLine(coordinates[i], coordinates[j])
        );
      }
    }
    return sumLength + "m";
  }
}
</script>

<style lang="stylus" scoped>
#wfsFeature
    z-index 1001
    position fixed
    top 25%
    right 10px
    width 350px
    height auto
    border 2px solid #42B983
    border-radius 10px
    box-shadow 0 0 5px #42B983
    background-color #2C3E50
    display flex
    flex-direction column
    opacity 0.8
    animation fadeIn 1s ease forwards
    cursor default
    @keyframes fadeIn
        from
          opacity 0
          transform translate(200%, 0) //往左移动自身宽的50%,往上移动自身高的200%
        to
          opacity .8
          transform translate(0, 0) //往左移动自身宽的50%,往上移动自身高的0%
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
      font-weight 800
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
    .naviSwitch
      margin-top 4px
      margin-left 1%
      width 98%
      height auto
      display flex
      flex-direction row
      .navi
        width 50%
        height 28px
        font-size 16px
        font-family "微软雅黑"
        text-align center
        color #FFFFFF
        border-bottom 2px solid #FFFFFF
        cursor pointer
      .navi.active
        color #42B983
        border-bottom 2px solid #42B983
    .info
      width auto
      height auto
      max-height 250px
      border-bottom-left-radius 10px
      border-bottom-right-radius 10px
      overflow-y auto
      overflow-x auto
      display flex
      flex-direction column
      padding 4px
      &::-webkit-scrollbar
        width 4px
      &::-webkit-scrollbar-track
        border-radius 2em
        background-color transparent
      &::-webkit-scrollbar-thumb
        background-color #606D78
        border-radius 2em
      table>.item>.key
        width 45%
        height 30px
        border 1px solid #ccc
        background-color #FFFFFF
        input
          width 100%
          height 100%
          border 0px
          text-align center
          background-color #FFFFFF
      table>.item>.value
        width 55%
        height 30px
        border 1px solid #ccc
        background-color #FFFFFF
        input
          width 100%
          height 100%
          border 0px
          text-align center
          background-color #FFFFFF
    .edit
      width auto
      height auto
      max-height 240px
      border-bottom-left-radius 10px
      border-bottom-right-radius 10px
      overflow-y auto
      overflow-x auto
      display flex
      flex-direction column
      padding 4px
      &::-webkit-scrollbar
        width 4px
      &::-webkit-scrollbar-track
        border-radius 2em
        background-color transparent
      &::-webkit-scrollbar-thumb
        background-color #606D78
        border-radius 2em
      table>tr
        font-size 14px
        font-family "微软雅黑"
        font-weight 400
        background-color #FFFFFF
      table>tr>td>button
        width 100%
        height 30px
        cursor pointer
      .key
        width 150px
        height 25px
        border 1px solid #ccc
        text-align center
        background-color #FFFFFF
      .value
        width 180px
        height 25px
        border 1px solid #ccc
        text-align center
        background-color #FFFFFF
      .btn
        width 168px
        height 30px
        border 1px solid #ccc
        text-align center
        background-color #FFFFFF
        cursor pointer
      .property
        width 166px
        height 25px
        border 1px solid #ccc
        text-align center
        background-color #FFFFFF
    .btns
      margin 1%
      width 97%
      height 30px
      display flex
      flex-direction row
      justify-content space-around
      .confirm,.delete
        width 48%
        height 30px
        font-size 16px
        font-weight 400
        font-family "微软雅黑"
        color #FFFFFF
        line-height 30px
        text-align center
        border-radius 2px
        cursor pointer
      .confirm
        background-color #42B983
      .delete
        background-color #d81e06
    .upload
      margin 1%
      width 97%
      height 30px
      display flex
      flex-direction row
      justify-content space-around
      color #FFFFFF
      background-color #25292E
      line-height 30px
      border-radius 2px
      cursor pointer
      opacity 0.8
</style>
