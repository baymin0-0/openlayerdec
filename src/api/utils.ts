/*
 * @Author: your name
 * @Date: 2021-01-12 09:08:31
 * @LastEditTime: 2021-01-12 09:10:58
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\api\utils.ts
 */
let Utils: any = {
  wfsReqURL: 'http://localhost:8088/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Ajw&maxFeatures=50&outputFormat=application%2Fjson', //wfs要素请求地址
  wfsSerURL: 'http://localhost:8088/geoserver/cite/ows?service=WFS', //提交地址
  featureNS: 'http://www.opengeospatial.net/cite', // 注意这个值必须为创建工作区时的命名空间URI
  featurePrefix: "cite", //工作空间名称
  featureType: 'jw', //图层名称
  srsName: 'EPSG:4326', //投影规范
}

export default Utils