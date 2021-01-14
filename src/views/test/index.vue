<!--
 * @Author: your name
 * @Date: 2021-01-11 15:58:49
 * @LastEditTime: 2021-01-13 11:25:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\views\Index.vue
-->
<template>
    <div id="map" ref="rootmap" @click="restore">
        <!-- 图层设置组件 -->
        <layer-setter  ref="layerSetter" :map="map"></layer-setter>
        
        <!-- 要素编辑器 -->
        <feature-editor ref="featureEditor" :map="map"></feature-editor>

        <!-- 控件器 -->
        <controller ref="controller" :map="map"></controller>
    </div>
</template>

<script lang='ts'>
/* eslint-disable */
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator'
// 引入openlayers类库
import "ol/ol.css"
import { Map , View , Feature } from "ol"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { Vector as VectorSource , TileWMS as WMSTileSource , ImageWMS as WMSImgSource } from "ol/source"
import { Point,LineString,Polygon,MultiPoint,MultiLineString,MultiPolygon } from "ol/geom"
import { Style , Icon , Stroke , Fill , Text , Circle , Options } from 'ol/style'
import { fromLonLat , toLonLat , transform , transformExtent} from "ol/proj.js"
import { Vector as VectorLayer } from "ol/layer"
import GeoJSON from "ol/format/GeoJSON"
import WFS from "ol/format/WFS"
import Control from 'ol/control/Control'
import Select from "ol/interaction/Select"
import Modify from "ol/interaction/Modify"
import Draw from "ol/interaction/Draw"
import { getArea, getLength, getDistance } from 'ol/sphere'
// 引入定义组件
import LayerSetter from "@/components/test/layerSetter/index.vue"
import FeatureEditor from "@/components/test/featureEditor/index.vue"
import Controller from "@/components/test/controller/index.vue"
@Component({
    // 注册组件
    components:{
        LayerSetter,
        FeatureEditor,
        Controller
    },
    // 传值注入(建议使用注解方式注入)
    // props:{}
})
export default class Container extends Vue {
    // 定义子组件的ref引用类型
    public $refs !: {
        layerSetter: LayerSetter,
        featureEditor: FeatureEditor,
        controller: Controller,
    }
    // 响应数据定义
    public map: any = null // 地图对象
    private mapView: any = new View({ // 地图窗口
        projection: "EPSG:4326",//坐标系
        center: [113.36617868236259,22.013946065413293], // 定义视窗中心位置
        zoom: 12 //缩放级别12级
    }) 
    public baseLayer: any = new TileLayer({source: new OSM()}) // 基础图层
    public drawSource: any = new VectorSource({wrapX: false}) // 绘制源
    public drawLayer: any = new VectorLayer({source: this.drawSource}) // 绘制图层
    public featureTip: Array<any> = [] // 要素与提示节点绑定
    public featureSelector: any = null // 要素选择器
    public featureModifier: any = null // 要素修改器
    public operateFeature: any = null // 当前操作的要素

    /**
     * 生命周期函数定义
     */
    beforeCreate() {}
    created() {}
    beforeMount() {}
    mounted() {
        // 初始化地图
        this.initMapListener()
        // 初始化要素选择器
        this.initFeatureSelector()
        // 初始化要素修改器
        this.initFeatureModifier()
    }
    beforeUpdate() {}
    updated() {}
    beforeDestroy() {}
    destroyed() {}

    /** 
     * methods方法定义
     * */
    // 初始化地图
    private initMapListener(): void{
        let _this = this
        this.map = new Map({
            target: "map",//挂载点
            layers:[//创建图层
                this.baseLayer,
                this.drawLayer,
            ],
            view: this.mapView,
            controls: []
        });
        // 监听地图的点击事件
        this.map.on('click', function(event: any) {
            // 点击时获取像素区域
            let pixel: any = _this.map.getEventPixel(event.originalEvent)
            // 像素区域是否存在Feature(要素),是则激活回调函数
            let feature = _this.map.forEachFeatureAtPixel(pixel, function(feature: any, layer: any) {
                // 获取点击时的坐标信息
                let coordinate = event.coordinate
                return feature
            });
            // 在要素设置中显示该要素详情信息(要素存在且当前不在绘制)
            if(feature&&_this.$refs.controller.drawInteractor==null){
                _this.operateFeature = feature
                _this.$refs.featureEditor.featureInfo.isActive = true
                _this.$refs.featureEditor.featureInfo.detailInfo.properties = []
                _this.$refs.featureEditor.featureInfo.editInfo.properties = []
                for(let key in feature.values_){
                    if(key=="the_geom"||key=="geometry"){
                        let num: number = 0
                        feature.values_[key].flatCoordinates.forEach((coord:Array<number>|null,index:number) => {
                        _this.$refs.featureEditor.featureInfo.detailInfo.properties.push({
                            key: index%2!=0?"longitude"+(num++):"latitude"+num,
                            value: coord
                        })
                        })
                    }else{
                        _this.$refs.featureEditor.featureInfo.editInfo.properties.push({
                            key: key,
                            value: feature.values_[key],
                            isActive: false
                        })
                    }
                }
            }else{ // 要素不存在或当前处于绘制
                // 还原要素设置
                _this.operateFeature = null
                _this.$refs.featureEditor.featureInfo.isActive = false
                _this.$refs.featureEditor.featureInfo.detailInfo.properties = []
                _this.$refs.featureEditor.featureInfo.editInfo.properties = []
            }
        });
    }
    // 初始化要素选择器
    private initFeatureSelector(): void{
        this.featureSelector = new Select({
            style: function(feature,resolution){
                return new Style({
                    stroke: new Stroke({
                        color: '#42B983',
                        lineDash: [5, 5],
                        width: 5
                    })
                })
            }
        });
    }
    // 初始化要素修改器
    private initFeatureModifier(): void{
        let _this = this
        this.featureModifier = new Modify({
            style: function(feature,resolution) {
                return new Style({
                    stroke: new Stroke({
                        color: '#42B983',
                        lineDash: [5, 5],
                        width: 5
                    })
                })
            },
            features: this.featureSelector.getFeatures(),
        })
        // 监听要素修改结束事件
        this.featureModifier.on("modifyend",function(event){
            let node: any,output: any
            _this.featureTip.forEach((item)=>{
                if(item.key == _this.operateFeature){
                    node = document.getElementById(item.id)
                }
            })
            if(_this.operateFeature.values_.geometry instanceof LineString){
                output = _this.formatLength(_this.operateFeature.values_.geometry)
                _this.operateFeature.values_.length = output
            }else if(_this.operateFeature.values_.geometry instanceof Polygon){
                output = _this.formatArea(_this.operateFeature.values_.geometry)
                _this.operateFeature.values_.area = output
            }
            if(node){
                node.innerHTML = output
            }
        })
    }
    // 格式化多边形面积
    public formatArea(polygon: any): string{
        let area: number = getArea(polygon,{projection: 'EPSG:4326'});
        let output: string;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'k㎡';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + '㎡';
        }
        return output;
    }
    // 格式化线段长度
    public formatLength(line: any): string{
        let length: number = getLength(line,{projection: 'EPSG:4326'});
        let output: string;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
        }
        return output;
    }
    public randomString(len: number|null): string {
        len = len || 32;
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
        　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    // wfs要素设置-还原
    public restore(): void{
        this.$refs.featureEditor.featureInfo.editInfo.isActive = false
        this.$refs.featureEditor.featureInfo.editInfo.properties.forEach((item) => {
            item.isActive = false
        })
    }
}
</script>

<style lang="stylus" scoped>
    #map:active
      cursor url("../../assets/Icons/fist.png"),auto
    #map
      left 0
      top 0
      right 0
      bottom 0
      height 100%
      width 100%
      position absolute
      cursor url("../../assets/Icons/scratch.png"),auto
      .ol-attribution,.ol-zoom
        display none
</style>