/*
 * @Author: your name
 * @Date: 2021-01-11 17:43:47
 * @LastEditTime: 2021-01-14 13:35:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\api\layerList.js
 */
/*
 * @Author: your name
 * @Date: 2021-01-11 16:07:17
 * @LastEditTime: 2021-01-11 17:43:43
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\api\layerList.js
 */
import geojsonData from "./geojsonData"
var layerList = [
    {
        "id": 1,
        "isActive": false,
        "name":"遥感影像地图及重点区域监测变化图",
        "items":[
            {
                "id": 1,
                "name":"重点区域监测变化图",
                "isActive": false,
                "type":"geojson",
                "geojson":geojsonData.geojson_1,
                "layer": null
            },
        ],
    },
    {
        "id": 2,
        "isActive": false,
        "name":"遥感影像地图及重点区域监测变化图",
        "items":[
            {
                "id": 1,
                "name":"重点区域监测变化图",
                "isActive": false,
                "type":"geojson",
                "geojson":geojsonData.geojson_2,
                "layer": null
            }
        ],
    },
    {
        "id": 3,
        "isActive": false,
        "name":"监测区域遥感影像图及新建楼盘顶层屋面专题图",
        "items":[
            {
                "id": 1,
                "name":"新建楼盘顶层屋面专题图",
                "isActive": false,
                "type":"geojson",
                "geojson":geojsonData.geojson_4,
                "layer": null
            }
        ],
    },
]
export default layerList;