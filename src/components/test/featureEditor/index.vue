<!--
 * @Author: your name
 * @Date: 2021-01-12 13:40:33
 * @LastEditTime: 2021-01-13 10:14:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\featureEditor\index.vue
-->
<template>
  <div id='featureEditor'>
      <!-- 要素增删改查 -->
      <div class="featureMod" ref="featureMod">
        <!-- 标题 -->
        <div class="title">
          <div class="icon">
              <img src="imgs/setup.png"/>
          </div>
          <span>WFS协议要素设置</span>
        </div>

        <!-- 查询要素 -->
        <div class="search">
          <div class="text">
              <input type="text" v-model="wfsURL" disabled="disabled"/>
          </div>
          <div class="button" @click="queryWfs">
            <span>查询要素</span>
          </div>
        </div>

        <!-- 详情与编辑层 -->
        <div class="labels" v-show="featureInfo.isActive">
          <div class="detail" :class="{active:featureInfo.currentId===featureInfo.detailInfo.id}" @click="changeInfo(featureInfo.detailInfo.id)">
            {{featureInfo.detailInfo.name}}
          </div>
          <div class="edit" :class="{active:featureInfo.currentId===featureInfo.editInfo.id}" @click="changeInfo(featureInfo.editInfo.id)">
            {{featureInfo.editInfo.name}}
          </div>
        </div>

        <!-- 详情层 -->
        <div class="detailContent" v-show="featureInfo.isActive&&featureInfo.currentId===featureInfo.detailInfo.id">
            <table border="0" cellpadding="0" cellspacing="0" v-show="featureInfo.detailInfo.properties.length!=0">
              <tr class="item" v-for="(item,index) in featureInfo.detailInfo.properties" :key="index">
                <td class="key">
                    <input type="text" disabled="disabled" v-model="item.key"/>
                </td>
                <td class="value">
                    <input type="text" disabled="disabled" v-model="item.value"/>
                </td>
              </tr>
            </table>
        </div>

        <!-- 编辑层 -->
        <div class="editContent" v-show="featureInfo.isActive&&featureInfo.currentId===featureInfo.editInfo.id">
          <div class="operate">
            <div class="add" @click="addProperty">
              <img src="imgs/add.png"/>
              <span>添加新属性</span>
            </div>
            <div class="delete" @click="deleteProperty" v-show="featureInfo.editInfo.isActive">
              <img src="imgs/del.png"/>
              <span>删除该属性</span>
            </div>
          </div>
          <div class="content">
            <table border="0" cellpadding="0" cellspacing="0" v-show="featureInfo.editInfo.properties.length!=0">
              <tr class="item" v-for="(item,index) in featureInfo.editInfo.properties" :key="index" @click.stop="editActive(index)">
                <td class="key">
                    <input :class="{active:item.isActive}" type="text" v-model="item.key" />
                </td>
                <td class="value">
                    <input :class="{active:item.isActive}" type="text" v-model="item.value" />
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- 编辑控件底层 -->
        <div class="bottom" v-show="featureInfo.isActive&&featureInfo.currentId===featureInfo.editInfo.id">
          <div class="save" @click="saveFeature">保存</div>
          <div class="del" @click="deleteFeature">删除</div>
        </div>
      </div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator' 
import { Map , View , Feature } from "ol"
import { Vector as VectorSource , TileWMS as WMSTileSource , ImageWMS as WMSImgSource } from "ol/source"
import { Point,LineString,Polygon,MultiPoint,MultiLineString,MultiPolygon } from "ol/geom"
import { Vector as VectorLayer } from "ol/layer"
import GeoJSON from "ol/format/GeoJSON"
import WFS from "ol/format/WFS"
import { Style , Icon , Stroke , Fill , Text , Circle , Options } from 'ol/style'
@Component({
    // 注册组件
    components:{},
    // 传值注入(建议使用注解方式注入)
    // props:{
    // }
})
export default class FeatureEditor extends Vue {
    // 定义父组件为Any类型
    public $parent !: any
    @Prop()
    private map: any 
    private wfsVectorLayer: any = null // wfs矢量图层
    private wfsVectorSource: any = null // wfs矢量图层源
    private wfsURL: string = "" // wfs要素请求地址
    // 响应数据定义
    public featureInfo: any = { // 要素信息
        currentId:0,
        isActive: false,// 要素被选择时才显示详情和编辑内容
        detailInfo:{
            id:0,
            name:"位置详情",
            properties:[
            {
                key: "NAME",
                value: "Jenkins",
            },
            {
                key: "STROKE",
                value: "BLUE",
            },
            {
                key: "FILL",
                value: "RED",
            }
            ]
        },
        editInfo:{
            id:1,
            name:"属性编辑",
            isActive: false,
            properties:[
            {
                key: "NAME",
                value: "Jenkins",
                isActive: false
            },
            {
                key: "STROKE",
                value: "BLUE",
                isActive: false
            },
            {
                key: "FILL",
                value: "RED",
                isActive: false
            }
            ]
        }
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
    // methods方法定义
    
    // wfs要素详情与编辑切换
    // 通过wfs协议从geosever服务器中查询要素
    queryWfs(): void{
        let _this = this
        if(this.wfsURL != "") {
            // 若wfs矢量图层已存在则先移除
            if(this.wfsVectorLayer) {
                this.map.removeLayer(this.wfsVectorLayer);
            }
            // 因为数据源里面字段the_geom存储的是geometry所以需要指定
            let geojson: any = new GeoJSON({geometryName: 'the_geom'})
            this.wfsVectorSource = new VectorSource({
                    format: geojson,
                    url: this.wfsURL // 请求地址为wfs服务地址
            })
            // 创建新的图层来加载wfs的要素
            this.wfsVectorLayer = new VectorLayer({
                opacity: 0.5,
                source: this.wfsVectorSource,
                style: function(feature,resolution) {
                    return new Style({
                        fill: new Fill({ //填充
                            color: "#FFFFFF"
                        }),
                        stroke: new Stroke({ //边线
                            color: 'red',
                            width: 2
                        }),
                    });
                }
            });
            // 向地图上添加wfs矢量图层
            this.map.addLayer(this.wfsVectorLayer);
        } else {
            alert("请输入wfs要素查询地址")
        }
    }
    // wfs要素设置-添加属性
    addProperty(): void{
        this.featureInfo.editInfo.properties.push({
            key: "",
            value: "",
            isActive: false
        })
    }
    // wfs要素设置-删除属性
    deleteProperty(): void{
        let _this = this
        this.featureInfo.editInfo.properties.forEach((item,index) => {
            if(item.isActive){
                // 先从要素中删除键值
                if(item.key!=""){
                    _this.$parent.operateFaeture.unset(item.key)
                }
                // 再从数组中删除
                _this.featureInfo.editInfo.properties.splice(index,1)
            }
        })
    }
    // 保存要素(如果是wfs拉取的要素则同时保存到geoserver上)
    saveFeature(): void{
        let isWFSFeature: any = this.isWFSFeature(this.$parent.operateFaeture)
        let keys: Array<string> = this.$parent.operateFaeture.getKeys()
        // 先将要素上的键值全部移除(除了key=="the_geom"||key=="geometry")
        keys.forEach((key)=>{
            if(key!="the_geom"&&key!="geometry"){
                this.$parent.operateFaeture.unset(key)
            }
            })
            // 再将数组上的键值存入到要素上
            this.featureInfo.editInfo.properties.forEach((property)=>{
            if(property.key!=""){
                this.$parent.operateFaeture.set(property.key,property.value)
            }
            })
            // 如果是wfs上的要素则发起请求更改否则则向wfs新增该要素
            if(this.wfsURL!=""){
            if(isWFSFeature){
                console.log("该要素是向wfs修改的要素")
                this.wfsFeatureSubmit(null,[this.wfsFeatureTrans()],null)
            }else{
                console.log("该要素是向wfs新增的要素")
                this.wfsFeatureSubmit([this.wfsFeatureTrans()],null,null)
            }
        }
    }
    // 删除要素(如果是wfs拉取的要素则同时从geoserver上删除)
    deleteFeature(): void{
        let isWFSFeature: any = this.isWFSFeature(this.$parent.operateFaeture)
        // 先将绑定的要素提示节点和覆盖层移除
        this.$parent.featureTip.forEach((item,index)=>{
            if(item.key==this.$parent.operateFaeture){
            let node: any = document.getElementById(item.id)
            if(node){
                node.parentNode.removeChild(node)
            }
            item.value.setPosition(undefined)
            item.value = null
            this.$parent.featureTip.splice(index,1)
            }
        })
        // 再将要素从数据源中移除
        if(isWFSFeature){
            // 从wfs源中删除要素
            this.wfsVectorSource.removeFeature(this.$parent.operateFaeture)
            // 同时向geoserver中进行删除
            console.log("该要素是向wfs删除的要素")
            this.wfsFeatureSubmit(null,null,[this.wfsFeatureTrans()])
        }else{
            // 从绘制源中删除要素
            this.$parent.drawSource.removeFeature(this.$parent.operateFaeture)
        }
        this.featureInfo.isActive = false
    }
    // 要素的增删改
    wfsFeatureSubmit(newFeatures: any, modFeatures: any, delFeatures: any): void{
        let _this = this
        // 添加要素时需要重新格式要素属性参数(注意:wfs不支持添加源中不存在的属性字段)
        if(newFeatures!=null){
            let geom: any = newFeatures[0].getGeometry()
            let formatFeature: any = new Feature({
                the_geom: geom instanceof Polygon ? new MultiPolygon([geom.getCoordinates()]) : geom instanceof LineString ? new MultiLineString([geom.getCoordinates()]) : new MultiPoint([geom.getCoordinates()]),
                Layer: "Layer",
                SubClasses:"SubClasses",
                ExtendedEn:"ExtendedEn",
                Linetype:"Linetype",
                EntityHand:"EntityHand",
                Text:"Text"
            })
            // 设置要素id
            if(newFeatures[0].getId()){
                formatFeature.setId(newFeatures[0].getId())
            }else{
                // formatFeature.setId(this.randomString(null)) // 父组件方法
                formatFeature.setId(this.$parent.randomString(null)) // 父组件方法
            }
            newFeatures = [formatFeature]
        }
        let WFSTSerializer: any = new WFS();
        // 参数一为要插入的功能,参数二为要更新的功能,参数三为要删除的功能
        let featObject: any = WFSTSerializer.writeTransaction(newFeatures, modFeatures, delFeatures, {
            featureNS: _this.$utils.featureNS,// 注意这个值必须为创建工作区时的命名空间URI
            featurePrefix: _this.$utils.featurePrefix,//工作空间名称
            featureType: _this.$utils.featureType,//图层名称
            srsName: _this.$utils.srsName //投影规范
        });
        // 转换为xml内容发送到服务器端
        let serializer: any = new XMLSerializer();
        let featString: string = serializer.serializeToString(featObject);
        console.log("上传的xml内容=>",featString)
        let request: any = new XMLHttpRequest();
        request.open('POST', this.$utils.wfsSerURL);
        // 指定内容为xml类型
        request.setRequestHeader('Content-Type', 'text/xml');
        request.send(featString);
    }
    // 要素内容转换
    wfsFeatureTrans(feature: any = null): any{
        if(feature==null){
            feature = this.$parent.operateFaeture.clone()
            feature.setId(this.$parent.operateFaeture.getId());
        }
        feature.getGeometry().applyTransform(function(flatCoordinates:Array<any>, flatCoordinates2:Array<any>, stride: any) {
            for(let j:number = 0; j < flatCoordinates.length; j += stride) {
            let y:number = flatCoordinates[j];
            let x:number = flatCoordinates[j + 1];
            flatCoordinates[j] = x;
            flatCoordinates[j + 1] = y;
            }
        });
        return feature
    }
    // 判断要素是否是wfs上的要素
    isWFSFeature(feature): boolean{
        if(this.wfsVectorSource){
            let wfsFeatures: any = this.wfsVectorSource.getFeatures()
            if(wfsFeatures!=null&&wfsFeatures.length>0){
                for(let index in wfsFeatures){
                    if(wfsFeatures[index]==feature){
                        return true
                    }
                }
                return false
            }
            return false
        }
        return false
    }
    changeInfo(id): void{
        this.featureInfo.currentId = id
    }
    // wfs要素设置-编辑
    editActive(index): void{
        this.featureInfo.editInfo.properties.forEach((item,ind) => {
        if(index==ind){
            item.isActive = true
        }else{
            item.isActive = false
        }
        })
        this.featureInfo.editInfo.isActive = true
    }
}
</script>

<style lang='stylus' scoped>
#featureEditor
    width auto
    height auto
    cursor pointer
    .featureMod
        top 540px
        left 10px
        transition width 0.75s, height 0.75s , border-radius 0.75s
        -moz-transition width 0.75s, height 0.75s,border-radius 0.75s
        -webkit-transition width 0.75s, height 0.75s,border-radius 0.75s
        -o-transition width 0.75s, height 0.75s,border-radius 0.75s
        height auto
        width 350px
        border-top-left-radius 10px
        border-top-right-radius 10px
        display flex
        flex-direction column
        border 1px solid #42B983
        box-shadow 0 0 5px #42B983
        background-color #2C3E50
        opacity 0.8
        position fixed
        z-index 1
        .bottom
          width auto
          height 35px
          margin-left 4px
          margin-right 6px
          margin-bottom 5px
          border 1px solid #FFFFFF
          display flex
          flex-direction row
          font-size 16px
          font-family "微软雅黑"
          color #FFFFFF
          div
           width 50%
           height auto
           text-align center
           line-height 35px
           cursor pointer
          .save
           background-color #42B983
          .del
           background-color #d81e06
        .labels
          margin-top 2px
          width auto
          height 25px
          display flex
          flex-direction row
          text-align center
          color #ffffff
          background-color #2C3E50
          font-size 16px
          font-family "微软雅黑"
          cursor pointer
          .detail
            width 50%
            height auto
            border-bottom 2px solid #FFFFFF
          .detail.active
            border-bottom 2px solid #42B983
          .edit
            width 50%
            height auto
            border-bottom 2px solid #FFFFFF
          .edit.active
            border-bottom 2px solid #42B983
        .detailContent
          width auto
          height auto
          max-height 250px
          50px
          overflow auto
          padding 3px
          table>.item>.key>input
            width 150px
            height 30px
            border 1px solid #ccc
            text-align center
          table>.item>.value>input
            width 190px
            height 30px
            border 1px solid #ccc
            text-align center
        .editContent
          margin-top 4px
          margin-left 4px
          margin-right 4px
          width auto
          height auto
          border-radius 5px
          .operate
            width auto
            height 25px
            display flex
            flex-direction row
            div
              width 50%
              height auto
              display flex
              flex-direction row
              cursor pointer
              img
                margin-left 40px
                margin-top 4px
                margin-right 4px
                width 15px
                height 15px
              span
                margin-top 2px
                display block
                font-size 14px
                font-family "微软雅黑"
            .add
              color #1296db
            .delete
              color #d81e06
          .content
            margin-top 4px
            width auto
            height auto
            max-height 150px
            overflow-y auto
            table>.item>.key>input
              width 150px
              height 30px
              border 1px solid #ccc
              text-align center
            table>.item>.value>input
              width 186px
              height 30px
              border 1px solid #ccc
              text-align center
            table>.item>.key>.active
              background-color #EEEEEE
              color #42B983
            table>.item>.value>.active
              background-color #EEEEEE
              color #42B983
        .search
          margin-top 2px
          width auto
          height 30px
          background-color #3d4c46
          border-bottom 1px solid #3d4c46
          overflow hidden
          display flex
          flex-direction row
          .text
            margin 2px
            width 250px
            height 25px
            border-radius 10px
            overflow hidden
            input
              width 100%
              height 100%
              border-radius 1px
          .button
            margin 2px
            width 90px
            height 25px
            background-color #42B983
            text-align center
            font-size 14px
            font-family "微软雅黑"
            line-height 25px
            cursor pointer
            color #FFFFFF
            border-radius 5px
        .title
          display flex
          flex-direction row
          width auto
          height 30px
          color #FFFFFF
          line-height 30px
          font-size 18px
          font-family "新宋体"
          border-bottom 1px solid
          border-image: -webkit-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          border-image: -moz-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          border-image: linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
          @keyframes fucks{
            from{transition:0.5s ease-in}
            to{transform:rotate(360deg)}
          }
          .icon
            margin-top 2px
            margin-left 80px
            margin-right 10px
            width 25px
            height 25px
            animation-name:fucks;
            animation-duration:2s;
            animation-iteration-count:infinite;
            img
              width 100%
              height 100%
</style>