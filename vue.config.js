/*
 * @Author: your name
 * @Date: 2020-12-17 14:17:59
 * @LastEditTime: 2021-01-14 09:57:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tsdemo\vue.config.js
 */
/* eslint-disable */
const path = require("path")
module.exports = {
    configureWebpack: { // webpack配置，值位对象时会合并配置，为方法时会改写配置
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                'vue$': 'vue/dist/vue.esm.js'
            }
        },
        devtool: 'inline-source-map'
    },
    lintOnSave: false,
    // baseUrl: '/',
    devServer: {
        host: "localhost",
        port: 8088,
        https: false, // https:{type:Boolean}
        open: true, //配置自动启动浏览器
        proxy: {
            '/api': {
                target: 'http://localhost:8080',// 写路由
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                  '^/api': ''
                }
            }
        }
    }
}