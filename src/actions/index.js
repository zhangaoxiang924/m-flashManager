/**
 * Author：zhoushuanglong
 * Time：2017/7/27
 * Description：index actions
 */

import { hashHistory } from 'react-router'
import Cookies from 'js-cookie'
import { axiosAjax } from '../public/index'
import { message } from 'antd'

import {
    GAMELIST,
    BREADCRUMB,
    NAVIGATION
} from '../constants/index'

// 登录
export const login = (sendData, fn) => {
    return (dispatch) => {
        axiosAjax('post', '/account/editor/login', sendData, function (data) {
            // console.log(data)
            fn && fn(data)
            if (data.code === 1) {
                for (let key in data.obj) {
                    Cookies.set(`hx_${key}`, data.obj[key], {
                        expires: 30
                    })
                }
                Cookies.set('loginStatus', true)
                hashHistory.push('/')
            } else {
                message.error(data.msg)
            }
        })
    }
}

// 登录
export const logout = (sendData) => {
    return (dispatch) => {
        axiosAjax('post', '/liveaccount/logout', sendData, function (data) {
            for (let key in data.obj) {
                Cookies.remove(`hx_${key}`)
            }
            Cookies.set('loginStatus', false)
            hashHistory.push('/login')
            message.success('已注销!')
        })
    }
}

// 首页游戏列表
export const gameList = () => {
    return (dispatch) => {
        axiosAjax('GET', '/sysinfo/gamelist', {}, function (data) {
            if (data.status === 200) {
                const actionData = data.data
                dispatch({
                    type: GAMELIST,
                    actionData
                })
            } else {
                message.error(data.msg)
            }
        })
    }
}

export const breadcrumb = (arr) => {
    return {
        type: BREADCRUMB,
        arr
    }
}

export const navigation = (selectkey, openkey) => {
    return {
        type: NAVIGATION,
        selectkey,
        openkey
    }
}
