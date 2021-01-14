import * as olSphere from "ol/sphere"; //主要方法有getArea, getLength, getDistance
import * as olExtent from "ol/extent";
import {
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from "ol/geom";
import {
  fromLonLat,
  toLonLat,
  transform,
  getTransform,
  transformExtent,
} from "ol/proj";

/**
 * @param {Object} coordinates 坐标数组[二维]
 * 类构造参数=>原始多边形坐标
 */
export default class Decompose {
  private _coordinates: Array<any> = [];
  private _EarInfo: Array<any> = new Array();
  private _Triangles: Array<any> = new Array();

  constructor(coordinates) {
    this._coordinates = coordinates;
  }

  /**
   * 私有
   * @param {Object} lPoint 左边点坐标
   * @param {Object} Point 判断点坐标
   * @param {Object} rPoint 右边点坐标
   * 判断坐标点是否符合构成顶点(判断与相邻的两个坐标点是否构成在一条直线上,是则无法构成顶点否则可以)
   */
  private judgePointIsVertex(
    lPoint: Array<any>,
    Point: Array<any>,
    rPoint: Array<any>
  ): boolean {
    // 由于是浮点数不能判断为0
    let slope = Math.abs(
      (rPoint[1] - Point[1]) * (lPoint[0] - Point[0]) -
        (lPoint[1] - Point[1]) * (rPoint[0] - Point[0])
    );
    // 精确判断
    if (slope <= 0.000000000001) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 私有
   * @param {Object} lVertex 左边顶点坐标
   * @param {Object} Vertex 判断顶点坐标
   * @param {Object} rVertex 右边顶点坐标
   * 返回true表示为凸角,false表示为凹角
   * 判断顶点的凹凸性(利用向量的叉乘判断,向量方向默认按逆时针)
   */
  private judgeVertexConcavity(
    lVertex: Array<any>,
    Vertex: Array<any>,
    rVertex: Array<any>
  ): boolean {
    let size =
      (lVertex[0] - Vertex[0]) * (rVertex[1] - Vertex[1]) -
      (lVertex[1] - Vertex[1]) * (rVertex[0] - Vertex[0]);
    return size > 0 ? true : false;
  }

  /**
   * 私有
   * @param {Object} lVertex 左边顶点坐标
   * @param {Object} Vertex 该判断顶点的坐标
   * @param {Object} rVertex 右边顶点坐标
   * @param {Object} Vertexs 所在区域上的所有顶点坐标
   * 判断顶点是否符合成为耳尖顶点的条件
   */
  private judgeVertexIsEar(
    lVertex: Array<any>,
    Vertex: Array<any>,
    rVertex: Array<any>,
    Vertexs: Array<any>
  ): boolean {
    let judgeVertexs = Decompose.deepcopy(Vertexs);
    let indL = judgeVertexs.findIndex(
      (item) => item.toString() == lVertex.toString()
    );
    if (indL != -1) {
      judgeVertexs.splice(indL, 1);
    }
    let ind = judgeVertexs.findIndex(
      (item) => item.toString() == Vertex.toString()
    );
    if (ind != -1) {
      judgeVertexs.splice(ind, 1);
    }
    let indR = judgeVertexs.findIndex(
      (item) => item.toString() == rVertex.toString()
    );
    if (indR != -1) {
      judgeVertexs.splice(indR, 1);
    }
    let triangleArr = new Array();
    let targetArr = new Array();
    targetArr.push(lVertex);
    targetArr.push(Vertex);
    targetArr.push(rVertex);
    triangleArr.push(targetArr);
    let triangle = new Polygon(triangleArr);
    // 满足条件一:该顶点必须是凸角
    let condition01 = this.judgeVertexConcavity(lVertex, Vertex, rVertex);
    // 满足条件二:该三个顶点形成的三角形几何不存在其他顶点坐标
    let condition02 = true;
    for (let index = 0; index < judgeVertexs.length; index++) {
      if (triangle.intersectsCoordinate(judgeVertexs[index])) {
        condition02 = false;
        break;
      }
    }
    return condition01 && condition02 ? true : false;
  }

  /**
   * 私有
   * @param {Object} coordinates 坐标数组
   * 筛选出能构成顶点的新数组返回(方向默认按逆时针)
   */
  private screenOutVertexs(coordinates: Array<any>): Array<any> {
    for (let index = 0; index < coordinates.length; index++) {
      if (coordinates.length < 3) {
        break;
      } else {
        if (index == 0) {
          if (
            !this.judgePointIsVertex(
              coordinates[coordinates.length - 1],
              coordinates[0],
              coordinates[1]
            )
          ) {
            coordinates.splice(0, 1);
            index--;
          }
        } else if (index == coordinates.length - 1) {
          if (
            !this.judgePointIsVertex(
              coordinates[index - 1],
              coordinates[index],
              coordinates[0]
            )
          ) {
            coordinates.splice(index, 1);
            index--;
          }
        } else {
          if (
            !this.judgePointIsVertex(
              coordinates[index - 1],
              coordinates[index],
              coordinates[index + 1]
            )
          ) {
            coordinates.splice(index, 1);
            index--;
          }
        }
      }
    }
    return coordinates;
  }

  /**
   * 私有
   * @param {Object} Vertexs 顶点数组
   * 筛选出能构成耳尖顶点的新数组返回
   */
  private screenOutEarVertexs(Vertexs: Array<any>): Array<any> {
    let endIndex = Vertexs.length - 1;
    // 顶点集合数量大于3则开始筛选
    if (Vertexs.length > 3) {
      this._EarInfo = new Array();
      let EarVertexs = new Array();
      Vertexs.forEach((item, index) => {
        let lVertex: Array<any>, rVertex: Array<any>;
        if (index == 0) {
          lVertex = Vertexs[endIndex];
          rVertex = Vertexs[1];
        } else if (index == endIndex) {
          lVertex = Vertexs[index - 1];
          rVertex = Vertexs[0];
        } else {
          lVertex = Vertexs[index - 1];
          rVertex = Vertexs[index + 1];
        }
        if (this.judgeVertexIsEar(lVertex, item, rVertex, Vertexs)) {
          EarVertexs.push(item);
          this._EarInfo.push([lVertex, item, rVertex]);
        }
      });
      return EarVertexs;
    } else {
      return [];
    }
  }

  /**
   * @param {Object} coordinates 多边形的坐标数组[三维]
   * 获取该数组中多边形的面积和
   */
  private getTotalPolygonArea(coordinates: Array<any>): number {
    let sum: number = 0;
    for (let i = 0; i < coordinates.length; i++) {
      sum += Decompose.getPolygonArea(Decompose.getPolygon(coordinates[i]));
    }
    return sum;
  }

  /**
   * @param {Object} coordinates 多边形坐标数组[三维]
   * @param {Object} seriesNum 连续长度
   * 获取坐标数组内某段连续面积累计最大的开始索引位置
   */
  private getSeriesMaxAreaIndex(
    coordinates: Array<any>,
    seriesNum: number
  ): number {
    if (seriesNum >= coordinates.length) {
      return 0;
    } else {
      let maxIndex = 0;
      let maxSum = this.getTotalPolygonArea(coordinates.slice(0, seriesNum)); // slice方法截取到的是start到end[end不包括]
      for (
        let start = 1, end = seriesNum + 1;
        start < coordinates.length && end <= coordinates.length;
        ++start, end = start + seriesNum
      ) {
        let sum = this.getTotalPolygonArea(coordinates.slice(start, end));
        if (maxSum < sum) {
          maxIndex = start;
          maxSum = sum;
        }
      }
      return maxIndex;
    }
  }

  /**
   * @param {Object} coordinates 多边形对象数组[三维]
   * 获取面积最大的三角形坐标数组索引值
   */
  private getMaxAreaCoordinateIndex(coordinates: Array<any>): number {
    let maxIndex = 0;
    let maxArea = Decompose.getPolygonArea(
        Decompose.getPolygon(coordinates[0])
      ),
      currentArea;
    for (let i = 1; i < coordinates.length; i++) {
      currentArea = Decompose.getPolygonArea(
        Decompose.getPolygon(coordinates[i])
      );
      if (maxArea < currentArea) {
        maxIndex = i;
        maxArea = currentArea;
      }
    }
    return maxIndex;
  }

  /**
   * @param {Object} polygons 多边形对象数组[三维]
   * 由多边形的面积由大到小进行排序多边形数组,选择排序过程
   */
  private sortCoordinatesByArea(coordinates: Array<any>): void {
    for (let i = 0; i < coordinates.length; i++) {
      let maxIndex = i;
      for (let j = i + 1; j < coordinates.length; j++) {
        // 找出面积最大值的索引
        if (
          Decompose.getPolygonArea(
            Decompose.getPolygon(coordinates[maxIndex])
          ) < Decompose.getPolygonArea(Decompose.getPolygon(coordinates[j]))
        ) {
          maxIndex = j;
        }
      }
      // 将找出的最大值的索引放置到数组首位
      if (maxIndex != i) {
        let coordinate = coordinates[maxIndex];
        coordinates.splice(maxIndex, 1);
        coordinates.unshift(coordinate);
      }
    }
  }

  /**
   * 私有
   * @param {Object} coordinates 三角形的各点坐标数组[二维]
   * 等分解一个三角形(一分为2)[三维]
   */
  private bisectOneTriangle(coordinates: Array<any>): Array<any> {
    if (coordinates.length >= 3) {
      let lEdgeLine = Decompose.getEdgeLine(coordinates[0], coordinates[1]);
      let lLen = Decompose.getLineLen(lEdgeLine);
      let edgeLine = Decompose.getEdgeLine(coordinates[0], coordinates[2]);
      let eLen = Decompose.getLineLen(edgeLine);
      let rEdgeLine = Decompose.getEdgeLine(coordinates[1], coordinates[2]);
      let rLen = Decompose.getLineLen(rEdgeLine);
      let triangles = new Array(); // 存放分解的三角形坐标数组[三维]
      // 统一约定线中心点为新三角形坐标的中间点
      if (lLen >= eLen && lLen >= rLen) {
        triangles.push([
          coordinates[0],
          lEdgeLine.getCoordinateAt(0.5),
          coordinates[2],
        ]);
        triangles.push([
          coordinates[2],
          lEdgeLine.getCoordinateAt(0.5),
          coordinates[1],
        ]);
        return triangles;
      }
      if (eLen >= lLen && eLen >= rLen) {
        triangles.push([
          coordinates[1],
          edgeLine.getCoordinateAt(0.5),
          coordinates[0],
        ]);
        triangles.push([
          coordinates[2],
          edgeLine.getCoordinateAt(0.5),
          coordinates[1],
        ]);
        return triangles;
      }
      if (rLen >= lLen && rLen >= eLen) {
        triangles.push([
          coordinates[0],
          rEdgeLine.getCoordinateAt(0.5),
          coordinates[2],
        ]);
        triangles.push([
          coordinates[1],
          rEdgeLine.getCoordinateAt(0.5),
          coordinates[0],
        ]);
        return triangles;
      }
      return triangles;
    } else {
      return [];
    }
  }

  /**
   * 私有
   * @param {Object} coordinates 三角形的坐标数组[二维]
   * @param {Object} specifyNum 指定分解数量
   * 按指定数量分解一个三角形(一分为n块)[三维]
   */
  private decomposeTriangleByNum(
    coordinates: Array<any>,
    specifyNum: number
  ): Array<any> {
    specifyNum = Math.abs(specifyNum);
    let newCoordinates = new Array(); // 存放分解的三角形坐标数组[三维]
    if (specifyNum == 1 || specifyNum == 0) {
      newCoordinates.push(coordinates);
      return newCoordinates;
    } else {
      for (let num = 1; num < specifyNum; num++) {
        if (newCoordinates.length != 0) {
          let maxIndex = this.getMaxAreaCoordinateIndex(newCoordinates); // 获取面积最大的索引
          let triangles = this.bisectOneTriangle(newCoordinates[maxIndex]);
          newCoordinates.splice(maxIndex + 1, 0, triangles[0], triangles[1]);
          newCoordinates.splice(maxIndex, 1); // 去掉分解的三角形
        } else {
          newCoordinates.push(...this.bisectOneTriangle(coordinates));
        }
      }
      return newCoordinates;
    }
  }

  /**
   * @param {Object} triangles 被分解的三角形坐标数组[三维]
   * 将被分解的三角形坐标数组还原回原来多边形的坐标数组[二维]
   */
  private restoreTrianglesToPolygon(triangles: Array<any>): Array<any> {
    // 先将三维降至二维
    let coordinates = new Array();
    triangles.forEach((triangle) => coordinates.push(...triangle));
    // 再将二维去重
    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i];
      for (let j = i + 1; j < coordinates.length; j++) {
        if (coordinate.toString() == coordinates[j].toString()) {
          coordinates.splice(j, 1);
          j--;
        }
      }
    }
    return coordinates;
  }

  /**
   * 公开
   * @param {Object} coordinates 多个三角形坐标数组[三维]
   * @param {Object} level 阶分解层级,建造满二叉树的过程(2的某次幂值)[三维]
   */
  public powDecomposeTriangles(
    triangles: Array<any>,
    level: number
  ): Array<any> {
    // 等分解
    let arr = new Array();
    triangles.forEach((triangle) => {
      arr.push(...this.bisectOneTriangle(triangle));
    });
    // 判断传递的阶层
    if (level == 0) {
      return triangles;
    }
    if (level == 1) {
      return arr;
    } else {
      return this.powDecomposeTriangles(arr, level - 1);
    }
  }

  /**
   * 公开
   * 将多边形分解为n-2个三角形[三维]
   */
  public decomposeToTriangles(): Array<any> {
    let Vertexs = this.screenOutVertexs(this._coordinates);
    // 再初始化耳尖
    let EarVertexs = this.screenOutEarVertexs(Vertexs);
    for (let index = 0; index < EarVertexs.length; index++) {
      this._Triangles.push(this._EarInfo[index]);
      let vIndex = Vertexs.findIndex(
        (item) => item.toString() == EarVertexs[index].toString()
      );
      Vertexs.splice(vIndex, 1);
      Vertexs = this.screenOutVertexs(Vertexs);
      EarVertexs = this.screenOutEarVertexs(Vertexs);
      index--;
    }
    // 将最终剩下的三角形存储
    this._Triangles.push(Vertexs);
    return this._Triangles;
  }

  /**
   * 公开
   * @param {Object} demand 分解数量
   * 按指定数量生产三角形(实质看成将一个三角形等分n次)
   */
  public specifyDecompose(demand: number) {
    let triangles = new Array(); // 三维
    if (this._coordinates.length > 3) {
      // 当前是多边形的坐标数组
      triangles.push(...this.decomposeToTriangles()); // 三维拼接
    } else {
      // 当前是三角形的坐标数组
      triangles.push(this._coordinates);
    }
    // 该多边形的固定产量
    let output: number = triangles.length;
    // 需求量与生产量的倍数与余数关系(需求是生产的多少倍,倍数后的余数是多少)
    let multiple: number = parseInt(demand / output + ""),
      remainder = demand % output;
    // 需求大于原定生产量
    if (multiple >= 1) {
      let newTriangles = new Array(); // 三维
      triangles.forEach((coordinates) => {
        newTriangles.push(...this.decomposeTriangleByNum(coordinates, multiple)); // 将每个三角形进行倍数的数值块进行分解
      });
      if (remainder == 0) {
        // 没有余数
        return newTriangles;
      } else {
        // 有余数(已知余数必定小于分解数)
        for (let i = 0; i < remainder; i++) {
          // 按余数值取出三角形进行一次等分解
          let maxIndex = this.getMaxAreaCoordinateIndex(newTriangles); // 取出面积最大的那个索引
          let coordinates = this.bisectOneTriangle(newTriangles[maxIndex]); // 等分解该三角形
          newTriangles.splice(maxIndex + 1, 0, coordinates[0], coordinates[1]);
          newTriangles.splice(maxIndex, 1); // 去除原最大的那个三角形
        }
        return newTriangles;
      }
    }
    // 需求小于原定生产量
    if (multiple < 1) {
      // 将剩余的块数进行合成新数组坐标再拼接到原数组上
      let diff = output - demand + 1;
      // 将连续(个数为diff个)面积组成的最小三角形拿出来合并成一个新三角形
      let maxIndex = this.getSeriesMaxAreaIndex(triangles, diff);
      let sliceTriangles = triangles.slice(maxIndex, maxIndex + diff); // 先将该连续组截取出来
      let coordinates = this.restoreTrianglesToPolygon(sliceTriangles);
      triangles.splice(maxIndex, diff); // 再将该连续组从原数组中去除
      triangles.splice(maxIndex, 0, coordinates); // 将拼接的坐标数组返回原位置
      return triangles;
    }
  }

  /**
   * 静态方法
   * @param {Object} obj 多维数组
   * 深度拷贝多维数组
   */
  static deepcopy(obj: Array<any>): Array<any> {
    let out: Array<any> = [],
      i = 0,
      len = obj.length;
    for (; i < len; i++) {
      if (obj[i] instanceof Array) {
        out[i] = Decompose.deepcopy(obj[i]);
      } else {
        out[i] = obj[i];
      }
    }
    return out;
  }

  /**
   * 静态方法
   * @param {Object} VertexA 点A坐标
   * @param {Object} VertexB 点B坐标
   * 根据两点坐标获取边的几何对象
   */
  static getEdgeLine(VertexA: Array<any>, VertexB: Array<any>): any {
    let line = new LineString([VertexA, VertexB]);
    return line;
  }

  /**
   * 静态方法
   * @param {Object} line 线几何对象
   * 获取线长度
   */
  static getLineLen(line: any): number {
    // 保证以米为测量(需要以厘米为单位)
    let len = olSphere.getLength(line, {
      projection: "EPSG:4326",
    });
    if (len > 100) {
      len = (Math.round((len / 1000) * 100) / 100) * 1000;
    } else {
      len = Math.round(Math.round(len * 100) / 100);
    }
    return len;
  }

  /**
   * 静态方法
   * @param {Object} coordinates 多边形坐标数组[二维]
   * 根据多边形坐标数组获取多边形对象
   */
  static getPolygon(coordinates: Array<any>): any {
    let polygonArr = new Array();
    polygonArr.push(coordinates);
    let polygon = new Polygon(polygonArr);
    return polygon;
  }

  /**
   * 静态方法
   * @param {Object} polygon 多边形对象
   * 获取多边形的面积
   * 根据多边形对象获取多边形面积
   */
  static getPolygonArea(polygon: any): number {
    let area = olSphere.getArea(polygon, {
      projection: "EPSG:4326",
    });
    if (area > 10000) {
      area = (Math.round((area / 1000000) * 100) / 100) * 1000;
    } else {
      area = Math.round(area * 100) / 100;
    }
    return area;
  }

  /**
   * 静态方法
   * @param {Object} arr 判断数组
   * 判断数组维度
   */
  public static dimensionArr(arr: Array<any>) {
    let j = 1;
    for (let i in arr) {
      if (arr[i] instanceof Array) {
        if (1 + Decompose.dimensionArr(arr[i]) > j) {
          j = j + Decompose.dimensionArr(arr[i]);
        }
      }
    }
    return j;
  }

  /**
   * 静态方法
   * @param {Object} num 整数值
   * 获取最接近某个数的2的次幂值(返回值小于等于传入值)
   */
  static getNearestPow(num: number): number {
    num |= num >> 1;
    num |= num >> 2;
    num |= num >> 4;
    num |= num >> 8;
    num |= num >> 16;
    return num - (num >>> 1);
  }

  /**
   * @param {Object} len 指定随机字符串的长度
   * 返回随机字符串
   */
  static getRandomString(len: any): string {
    len = len || 32;
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    let maxPos = $chars.length;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }

  /**
   * 生成并返回随机颜色
   */
  static getRandomColor(): any {
    let colorValue = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
    let colorArray = colorValue.split(",");
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += colorArray[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * 将原坐标数组的首位和尾位进行对应同值
   * @param {Object} coordinates 二维数组
   */
  public static reductCoordinates(coordinates: Array<any>): Array<any> {
    let newCoordinates = Decompose.deepcopy(coordinates);
    newCoordinates.push(newCoordinates[0]);
    return newCoordinates;
  }
}