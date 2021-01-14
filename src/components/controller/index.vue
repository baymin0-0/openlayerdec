<!--
 * @Author: your name
 * @Date: 2021-01-13 11:28:59
 * @LastEditTime: 2021-01-14 13:06:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\components\controls\index.vue
-->
<template>
  <div id="controller">
    <!-- 控件组件 -->
    <div class="controls" ref="controls">
      <div
        v-for="(item, index) in controls"
        :key="index"
        @click="changeActive(item.id)"
      >
        <img
          class="control"
          :class="{ active: item.isActive }"
          :src="item.curIcon"
          :title="item.title"
        />
      </div>
    </div>
    <!-- 控件组件之图层对比 -->
    <div class="layerCompare" ref="layerCompare" v-show="layerCompare.isActive">
      <div class="title">
        <span>{{ layerCompare.title }}</span>
      </div>
      <div class="list">
        <div
          class="item"
          :class="[{ active: item.isCheck }, { disable: !item.canClick }]"
          v-for="(item, index) in layerCompare.list"
          :key="index"
          @click="checkboxClick(index)"
        >
          <input
            type="checkbox"
            style="margin-right: 4px"
            :checked="item.isCheck"
            :disabled="true"
          />
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div
        class="confirm"
        v-show="layerCompare.showConfirm"
        @click.stop="openCompare"
      >
        开始对比
      </div>
      <div
        class="cancel"
        v-show="layerCompare.showCancel"
        @click.stop="closeCompare"
      >
        关闭对比
      </div>
    </div>
    <!---->
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
import { Draw, Select, Modify, Snap } from "ol/interaction";
import { Style, Icon, Stroke, Fill, Text, Circle, Options } from "ol/style";
import {
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from "ol/geom";
@Component({
  // 注册组件
  components: {},
  // 传值注入(建议使用注解方式注入)
  // props:{}
})
export default class Controller extends Vue {
  public $parent!: any;
  public $refs!: any;
  // 响应数据自定义
  // 控件列表
  private controls: any = [
    {
      id: "position",
      title: "添加标记点",
      curIcon: "imgs/position-off.png",
      upIcon: "imgs/position-up.png",
      offIcon: "imgs/position-off.png",
      isActive: false,
    },
    {
      id: "measure",
      title: "绘制多边形",
      curIcon: "imgs/measure-off.png",
      upIcon: "imgs/measure-up.png",
      offIcon: "imgs/measure-off.png",
      isActive: false,
    },
    {
      id: "rule",
      title: "绘制线段",
      curIcon: "imgs/rule-off.png",
      upIcon: "imgs/rule-up.png",
      offIcon: "imgs/rule-off.png",
      isActive: false,
    },
    {
      id: "compare",
      title: "屏比数据",
      curIcon: "imgs/compare-off.png",
      upIcon: "imgs/compare-up.png",
      offIcon: "imgs/compare-off.png",
      isActive: false,
    },
    {
      id: "edit",
      title: "编辑要素",
      curIcon: "imgs/edit-off.png",
      upIcon: "imgs/edit-up.png",
      offIcon: "imgs/edit-off.png",
      isActive: false,
    },
    {
      id: "clear",
      title: "清空要素",
      curIcon: "imgs/clear-off.png",
      upIcon: "imgs/clear-up.png",
      offIcon: "imgs/clear-off.png",
      isActive: false,
    },
    {
      id: "logout",
      title: "退出账号",
      curIcon: "imgs/logout-off.png",
      upIcon: "imgs/logout-up.png",
      offIcon: "imgs/logout-off.png",
      isActive: false,
    },
  ];

  //图层对比
  private layerCompare: any = {
    isActive: false,
    title: "图层对比列表",
    showConfirm: false,
    showCancel: false,
    //图层对比列表
    list: [
      {
        id: 0,
        name: "2019年11月0.5米遥感影像",
        isCheck: false,
        canClick: true,
      },
      {
        id: 1,
        name: "2020年01月0.5米遥感影像",
        isCheck: false,
        canClick: true,
      },
      {
        id: 2,
        name: "2019年12月0.3米遥感影像",
        isCheck: false,
        canClick: true,
      },
    ],
  };
  private selectInteraction: any = null;
  private modifyInteraction: any = null;
  private drawInteraction: any = null;
  private closeControls: Array<any> = [];
  public noneControlOpen: boolean = true;
  // 生命周期函数
  beforeCreate() {}
  created() {}
  beforeMount() {}
  @Watch("noneControlOpen")
  watchNoneControlOpen(newVal: any,oldVal: any){
    this.$bus.$emit("noneControlOpen",newVal)
  }
  mounted() {}
  beforeUpdate() {}
  updated() {}
  beforeDestroy() {}
  destroyed() {}
  // methods方法自定义
  private changeActive(id: number | string | null | undefined): void {
    // 切换控件(改变控件状态)
    let _this = this;
    let map: any = this.$parent.map;
    this.closeControls = [];
    this.controls.forEach((item) => {
      if (item.id === id) {
        item.isActive = !item.isActive;
      } else {
        item.isActive = false;
      }
      // 图片切换
      item.curIcon = item.isActive ? item.upIcon : item.offIcon;
      // 统计关闭控件的个数
      !item.isActive && this.closeControls.push(item);
      // 图层对比状态更新
      // if(item.id=="compare"){
      //   _this.layerCompare.isActive = item.isActive
      // }
    });
    // 所有的控件是否都处于关闭状态,是则显示wfsFeature组件
    this.closeControls.length == this.controls.length ? (this.noneControlOpen = true) : (this.noneControlOpen = false);
    // 进一步判断切换的控件 
    let control: any = this.controls.find((item) => {
      return item.id == id;
    });
    this.switchControl(control);
  }
  private switchControl(control: any): void {
    // 选中控件
    let _this = this;
    // 先将绘制器移除
    this.$parent.map.removeInteraction(this.drawInteraction);
    this.$parent.map.removeInteraction(this.selectInteraction);
    this.$parent.map.removeInteraction(this.modifyInteraction);
    // 选中的是屏比控件
    if (control.id == "compare") {
      if (control.isActive) {
        // 显示屏比框
        this.layerCompare.isActive = true;
      } else {
        // 隐藏并还原屏比框设置
        this.restoreLayerCompare();
      }
    } else {
      // 隐藏并还原屏比框设置
      this.restoreLayerCompare();
      // 继续匹配
      switch (control.id) {
        case "position":
          control.isActive && this.addDrawInteraction("Point");
          break;
        case "measure":
          control.isActive && this.addDrawInteraction("Polygon");
          break;
        case "rule":
          control.isActive && this.addDrawInteraction("LineString");
          break;
        case "edit":
          control.isActive
            ? this.addModifyInteraction()
            : (this.$parent.operateFeatrue = null);
          break;
        case "clear":
          this.$bus.$emit("removeAllFeatures", true);
          setTimeout(function () {
            control.curIcon = control.offIcon;
            control.isActive = false;
            _this.noneControlOpen = true;
          }, 250);
          break;
        case "logout":
          console.log("退出");
          control.isActive && this.$router.push("/");
          break;
        default:
          break;
      }
    }
  }
  private addDrawInteraction(drawType: any): void {
    // 添加绘制器
    let _this = this;
    // 先移除原有交绘层
    this.$parent.map.removeInteraction(this.drawInteraction);
    // 创建新的交绘器
    this.drawInteraction = new Draw({
      source: this.$parent.wfsVectorSource,
      type: drawType,
      // 交绘样式
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.8)",
        }),
        stroke: new Stroke({
          color: "#42B983",
          width: 2,
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: "#42B983",
          }),
        }),
      }),
    });
    // 添加交绘结束监听器
    this.drawInteraction.on("drawend", function (event) {
      // 设置默认样式
      event.feature.setStyle(
        new Style({
          fill: new Fill({
            color: "#FFFFFF",
          }),
          stroke: new Stroke({
            color: "#42B983",
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "#42B983",
            }),
          }),
        })
      );
      if (event.feature.getGeometry() instanceof Polygon) {
        event.feature.setGeometry(
          new MultiPolygon([event.feature.getGeometry().getCoordinates(false)])
        );
        _this.$parent.drawFeatures.push(event.feature);
      }
    });
    this.$parent.map.addInteraction(this.drawInteraction);
  }
  private addModifyInteraction(): void {
    // 添加绘制修改器
    let _this = this;
    this.$parent.map.removeInteraction(this.selectInteraction);
    this.$parent.map.removeInteraction(this.modifyInteraction);
    this.selectInteraction = new Select({
      style: new Style({
        stroke: new Stroke({
          color: "#d81e06",
          width: 2,
        }),
      }),
    });
    this.modifyInteraction = new Modify({
      style: function (feature, resolution) {
        let style = feature.getStyle() ? feature.getStyle() : new Style();
        style.setStroke(new Stroke({ color: "#d81e06" }));
        style.setImage(
          new Circle({ radius: 4, fill: new Fill({ color: "#42B983" }) })
        );
        feature.setStyle(style);
        return style;
      },
      features: _this.selectInteraction.getFeatures(),
    });
    this.$parent.map.addInteraction(this.selectInteraction);
    this.$parent.map.addInteraction(this.modifyInteraction);
  }
  private checkboxClick(index: number): void {
    // 图层对比选择
    if (this.layerCompare.list[index].canClick) {
      this.layerCompare.list[index].isCheck = !this.layerCompare.list[index]
        .isCheck;
      if (!this.layerCompare.list[index].isCheck) {
        this.layerCompare.list[index].canClick = true;
        this.layerCompare.list.forEach((item) => {
          item.canClick = true;
        });
        this.layerCompare.showConfirm = false;
      } else {
        // 统计已勾选的个数
        let ind,
          num = 0;
        this.layerCompare.list.forEach((item, idx) => {
          if (item.isCheck) {
            num++;
          } else {
            ind = idx;
          }
        });
        if (num == 2) {
          this.layerCompare.list[ind].canClick = false; // 保证了勾选个数不超过3
          this.layerCompare.showConfirm = true;
        } else {
          this.layerCompare.list.forEach((item) => {
            item.canClick = true;
          });
          this.layerCompare.showConfirm = false;
        }
      }
    }
  }
  restoreLayerCompare(): void {
    // 还原屏比框
    this.layerCompare.isActive = false;
    this.layerCompare.showConfirm = false;
    this.layerCompare.showCancel = false;
    this.layerCompare.list.forEach((item) => {
      item.isCheck = false;
      item.canClick = true;
    });
  }

  private openCompare(): void {
    // 开启屏比按钮
    this.layerCompare.showConfirm = false;
    this.layerCompare.showCancel = true;
  }

  private closeCompare(): void {
    // 关闭屏比按钮
    this.layerCompare.showConfirm = true;
    this.layerCompare.showCancel = false;
  }
}
</script>

<style lang='stylus' scoped>
#controller
    position fixed
    z-index 3
    top 10px
    right 10px
    width auto
    height auto
    .controls
      top 10px
      right 10px
      height auto
      width auto
      border 1px solid #42B983
      border-radius 50px
      box-shadow 0 0 5px #42B983
      background-color #2C3E50
      opacity 0.6
      position fixed
      display flex
      flex-direction row
      justify-content space-around
      padding-right 25px
      z-index 3
      .control
        margin-top 5px
        margin-left 25px
        width 30px
        height 30px
        cursor pointer
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
      z-index 3
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