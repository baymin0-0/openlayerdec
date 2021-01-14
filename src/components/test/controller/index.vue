<!--
 * @Author: your name
 * @Date: 2021-01-12 14:30:31
 * @LastEditTime: 2021-01-13 10:58:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\controller\index.vue
-->
<template>
  <div id='controller'>
      <!-- 控件层 -->
      <div class="controls" ref="controls">
        <div v-for="(item,index) in controls" :key="index" @click="changeActive(item.id)">
          <img class="control" :class="{active:item.isActive}" :src="item.path"/>
        </div>
      </div>
      <!-- 图层对比 -->
      <div class="layerCompare" ref="layerCompare" v-show="layerCompare.isActive">
          <div class="title">
            <span>{{layerCompare.title}}</span>
          </div>
          <div class="list">
              <div class="item" :class="[{active:item.isCheck},{disable:!item.canClick}]" v-for="(item,index) in layerCompare.list" :key="index" @click="checkboxClick(index)">
                <input type="checkbox" style="margin-right: 4px;" :checked="item.isCheck" :disabled="true"/>
                <span>{{item.name}}</span>
              </div>
          </div>
          <div class="confirm" v-show="layerCompare.showConfirm" @click.stop="">
            开始对比
          </div>
          <div class="cancel" v-show="layerCompare.showCancel" @click.stop="">
            关闭对比
          </div>
      </div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator' 
import { Point,LineString,Polygon,MultiPoint,MultiLineString,MultiPolygon } from "ol/geom"
import { Style , Icon , Stroke , Fill , Text , Circle , Options } from 'ol/style'
import { unByKey } from 'ol/Observable'
import Draw from "ol/interaction/Draw"
import Overlay from 'ol/Overlay'
@Component({
    // 注册组件
    components:{},
    // 传值注入(建议使用注解方式注入)
    // props:{}
})
export default class Controller extends Vue {
    // 定义父组件为Any类型
    public $parent !: any
    @Prop()
    private map: any
    private drawFeatures: Array<any> = [] // 已绘制的要素
    private sketch: any = null // 当前操作的要素
    private measureTipElement: any = null // 测量提示节点
    private currentMeasureTip: any = null // 当前测量提示
    private measureTips: Array<any> = [] // 记录提示节点
    // 公开
    public drawInteractor: any = null // 交绘器
    public operator: string = "" // 当前操作的控件id
    // 响应数据定义
    private controls: Array<any> = [ // 控件对象
          {
            id:"measure",
            type:"Polygon",
            path:"imgs/measure-off.png",
            isActive: false
          },
          {
            id:"rule",
            type:"LineString",
            path:"imgs/rule-off.png",
            isActive: false
          },
          {
            id:"compare",
            type:"",
            path:"imgs/compare-off.png",
            isActive: false
          },
          {
            id:"edit",
            type:"",
            path:"imgs/edit-off.png",
            isActive: false
          },
          {
            id:"clear",
            type:"",
            path:"imgs/clear-off.png",
            isActive: false
          },
          {
            id:"logout",
            type:"",
            path:"imgs/logout-off.png",
            isActive: false
          },
    ]
    private layerCompare: any = { // 图层对比对象
         isActive: false,
          title: "图层对比列表",
          list: [
            {
              id: 0,
              name: "2019年11月0.5米遥感影像",
              isCheck: false,
              canClick: true
            },
            {
              id: 1,
              name: "2020年01月0.5米遥感影像",
              isCheck: false,
              canClick: true
            },
            {
              id: 2,
              name: "2019年12月0.3米遥感影像",
              isCheck: false,
              canClick: true
            },
          ],
          showConfirm: false,
          showCancel: false
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
    // 图层对比选择
    checkboxClick(index): void{
        if(this.layerCompare.list[index].canClick){
            this.layerCompare.list[index].isCheck = !this.layerCompare.list[index].isCheck
            if(!this.layerCompare.list[index].isCheck){
                this.layerCompare.list[index].canClick = true
                this.layerCompare.list.forEach((item) => {
                    item.canClick = true
                })
                this.layerCompare.showConfirm = false
            }else{
                // 统计已勾选的个数
                let ind: any,num: number = 0
                this.layerCompare.list.forEach((item,idx) => {
                    if(item.isCheck){
                        num++
                    }else{
                        ind = idx
                    }
                })
                if(num==2){
                    this.layerCompare.list[ind].canClick = false // 保证了勾选个数不超过3
                    this.layerCompare.showConfirm = true
                }else{
                    this.layerCompare.list.forEach((item) => {
                        item.canClick = true
                    })
                    this.layerCompare.showConfirm = false
                }
            }
        }
    }
    // 切换控件(改变控件状态)
    changeActive(id): void{
        let _this = this
        this.controls.forEach((item) => {
            if(item.id===id){
                item.isActive = !item.isActive
                // 先移除要素选择器和要素修改器以及绘制器
                _this.map.removeInteraction(_this.$parent.featureSelector)
                _this.map.removeInteraction(_this.$parent.featureModifier)
                if(_this.drawInteractor){
                    _this.map.removeInteraction(_this.drawInteractor)
                    _this.drawInteractor = null
                }
                // 控件选中
                if(item.isActive){
                    _this.operator = item.id
                    switch(item.id){
                        case "measure":
                            _this.addDrawInteraction("Polygon")
                            ;break;
                        case "rule":
                            _this.addDrawInteraction("LineString")
                            ;break;
                        case "edit":
                            // 添加要素选择器和修改器
                            _this.map.addInteraction(_this.$parent.featureSelector)
                            _this.map.addInteraction(_this.$parent.featureModifier)
                            ;break;
                        case "clear":
                            _this.removeDrawFeatures()
                        ;break;
                    }
                }else{
                    _this.operator = ''
                }
            }else{
                item.isActive = false
            }
            switch(item.id){
                case "measure":
                        item.path = item.isActive?'imgs/measure-up.png':'imgs/measure-off.png';
                        break;
                case "rule":
                        item.path = item.isActive?'imgs/rule-up.png':'imgs/rule-off.png';
                        break;
                case "compare":
                        item.path = item.isActive?'imgs/compare-up.png':'imgs/compare-off.png';
                        _this.layerCompare.isActive = item.isActive
                        // 未实现的功能层
                        break;
                case "edit":
                        item.path = item.isActive?'imgs/edit-up.png':'imgs/edit-off.png';
                        break;
                case "clear":
                        item.path = item.isActive?'imgs/clear-up.png':'imgs/clear-off.png';
                        break;
                case "logout":
                        item.path = item.isActive?'imgs/logout-up.png':'imgs/logout-off.png';
                        break;
            }
        })
    }
    addDrawInteraction(type): void{
        let _this = this
        // 根据所传类型创建绘制交互器
        this.drawInteractor = new Draw({
        source: this.$parent.drawSource, 
        type: type, 
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
                color: 'rgba(66, 185, 131, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new Circle({
                radius: 5,
                stroke: new Stroke({
                    color: 'rgba(66, 185, 131, 0.7)',
                    width: 2
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
        });
        this.map.addInteraction(this.drawInteractor)
        // 测量提示
        this.createMeasureTip()
        // 绘制器上的几何变换监听
        let listener: any,key: string
        //绘制开始
        this.drawInteractor.on('drawstart',function(event){
            _this.drawFeatures.push(event.feature)
            _this.sketch = event.feature
            let coordinate = event.coordinate
            listener = _this.sketch.getGeometry().on('change',function(evt){
                let geom: any = evt.target
                let output: any
                if(geom instanceof Polygon){
                    key = "area"
                    // 面积计算存在bug
                    output = _this.$parent.formatArea(geom) 
                    coordinate = geom.getInteriorPoint().getCoordinates()
                }else if(geom instanceof LineString){
                    key = "length"
                    // 长度计算存在bug
                    output = _this.$parent.formatLength(geom) 
                    coordinate = geom.getLastCoordinate()
                }
                // 添加覆盖层显示的内容
                _this.measureTipElement.innerHTML = output
                _this.currentMeasureTip.setPosition(coordinate)
            })
        },this);
        //绘制结束
        this.drawInteractor.on('drawend',function(event: any){
            // 将节点的类名改变同时添加唯一id属性
            let randomId:any = _this.$parent.randomString(6); 
            _this.measureTipElement.className = "tooltip tooltip-static"
            _this.measureTipElement.setAttribute("id",randomId)
            event.feature.set(key,_this.measureTipElement.innerHTML)
            _this.currentMeasureTip.setOffset([0,-7])
            _this.sketch = null
            _this.measureTipElement = null
            _this.createMeasureTip(randomId,event.feature)
            unByKey(listener)
        },this);
    }
    // 移除各图源中的所有要素
    removeDrawFeatures(): void{
        this.$parent.$refs.featureEditor.featureInfo.isActive = false
        let _this = this
        // 图形要素移除
        if(!!this.$parent.featureTip&&Array.isArray(this.$parent.featureTip)){          
            this.$parent.featureTip.forEach((item,index)=>{
                let node: any = document.getElementById(item.id)
                if(node){
                    node.parentNode.removeChild(node)
                }
                if(_this.$parent.drawSource){ 
                    _this.$parent.drawSource.removeFeature(item.key)
                }
                item.value.setPosition(undefined)
                item.value = null
            });
            this.$parent.featureTip = []
        }
    }
    // 面积测量提示
    createMeasureTip(id:any = null,feature: any = null): void{
        let _this = this;
        if (_this.measureTipElement) {
            _this.measureTipElement.parentNode.removeChild(_this.measureTipElement);
        }
        _this.measureTipElement = document.createElement('div');
        _this.measureTipElement.className = 'tooltip tooltip-measure';
        _this.currentMeasureTip = new Overlay({
            element: _this.measureTipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        if(id!=null&&feature!=null){
            _this.measureTips.push(_this.currentMeasureTip)
            _this.bindFeatureTip(id,feature,_this.currentMeasureTip)
        }
        this.map.addOverlay(_this.currentMeasureTip);
    }
    // 将要素和提示进行绑定
    bindFeatureTip(id: string,feature: any,measureTip: any): void{
        this.$parent.featureTip.push({
            id: id,
            key: feature,
            value: measureTip
        })
    }
}
</script>

<style lang='stylus' scoped>
#controller
    width auto
    height auto
    cursor pointer
    .controls
        top 10px
        right 10px
        height 40px
        width auto
        border 1px solid #42B983
        border-radius 50px
        box-shadow 0 0 5px #42B983
        background-color #2C3E50
        opacity 0.6
        position fixed
        display flex
        flex-direction row
        z-index 1
        padding-right 25px
        .control
          margin-top 5px
          margin-left 25px
          width 30px
          height 30px
      .layerCompare
        top 60px
        right 18px
        height auto
        width 280px
        border-radius 5px
        box-shadow 0 0 5px #42B983 inset
        background-color #2C3E50
        opacity 0.8
        position fixed
        display flex
        flex-direction column
        z-index 1
        border 2px solid #42B983
        transition width 2s
        -moz-transition width 2s
        -webkit-transition width 2s
        -o-transition width 2s
        overflow hidden
        .title
          width auto
          height 40px
          padding-top 10px
          text-align center
          font-size 18px
          font-family "微软雅黑"
          color #FFFFFF
          background: radial-gradient(ellipse, #2C3E50, #42B983);
          background: -ms-radial-gradient(ellipse, #2C3E50, #42B983);
          background: -webkit-radial-gradient(ellipse, #2C3E50, #42B983);
          background: -moz-radial-gradient(ellipse, #2C3E50, #42B983);
          overflow hidden
        .list
          width auto
          height 150px
          font-size 14px
          color #FFFFFF
          overflow hidden
          .item
            width auto
            height 30px
            padding-top 10px
            padding-left 20px
            border-bottom 1px solid
            border-image: -webkit-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
            border-image: -moz-linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
            border-image: linear-gradient(to left, rgba(255,255,255,0.00) 1%, #42B983 50%, rgba(255,255,255,0.00) 100%) 2 2 2 2
            cursor pointer
          .item.active
            color #42B983
          .item.disable
            cursor not-allowed
        .confirm
          width auto
          height 20px
          padding 10px
          text-align center
          color #FFFFFF
          background-color #42B983
          border-bottom-left-radius 5px
          border-bottom-right-radius 5px
          cursor pointer
          overflow hidden
        .cancel
          width auto
          height 20px
          padding 10px
          text-align center
          color #FFFFFF
          background-color #d81e06
          border-bottom-left-radius 5px
          border-bottom-right-radius 5px
          cursor pointer
          overflow hidden
</style>