/*
 * @Author: your name
 * @Date: 2021-01-11 13:27:13
 * @LastEditTime: 2021-01-12 08:54:02
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \oplydecom\src\api\api.ts
 */
import request from '@/utils/request.ts';
/* eslint-disable */
class Api {
    // 封装的请求方法
    login(params: any) {
        return request({
            url: '/api/user/login.do', //请求的路由
            method: 'post', //请求的方法，默认为get
            data: params //发送请求所需的参数
        })
    }
}

export default Api;