/**
 * Author：zhoushuanglong
 * Time：2017/7/27
 * Description：public function
 */

import axios from 'axios'
import Cookies from 'js-cookie'
import {hashHistory} from 'react-router'
import {message} from 'antd'
import qs from 'qs'
import md5 from 'blueimp-md5'
import { Base64 } from 'js-base64'

export let URL = '/mgr'
// export const site = 'http://www.huoxing24.com'
export const site = 'http://www.huoxing24.vip'

export const getSig = () => {
    let platform = 'pc'
    let appSecret = 'Fbz]OdjAyhpqOIKA'
    let nonceArr = 'abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ1234567890'
    let timestamp = new Date().getTime()
    let nonce = ''
    for (let i = 0; i < 6; i++) {
        let j = Math.round(Math.random() * nonceArr.length)
        nonce += nonceArr[j]
    }
    let sig = md5('platform=' + platform + '&timestamp=' + timestamp + '&nonce=' + nonce + '&' + appSecret)
    let base64 = Base64.encode(JSON.stringify({
        'platform': platform,
        'nonce': nonce,
        'timestamp': timestamp,
        'sig': sig
    }))
    return base64
}

// export const URL = 'http://wechatstore.linekong.com'
export const axiosPost = (url, params, fn) => {
    let _url = URL + url
    axios.post(_url, params, {
        headers: {'Sign-Param': getSig()}
    }).then(function (response) {
        const data = response.data
        fn.call(this, data)
    }).catch(function (error) {
        fn.call(this, error)
        if (error.response) {
            if (/^(5)\d{2}/.test(error.response.status)) {
                message.error(`服务器异常 ${error.response.status}`)
            }
            if (/^(4)\d{2}/.test(error.response.status)) {
                message.error(`请求地址或参数异常 ${error.response.status}`)
            }
        } else if (error.request) {
            message.error('网络出现异常, 上传失败!')
        } else {
            message.error('Error', error.message)
        }
    })
}
export const axiosAjax = (type, url, params, fn, headers) => {
    URL = url.split('/')[1] === 'passport' ? '' : '/mgr'
    let _url = URL + url
    let opt = {
        method: type,
        url: _url,
        headers: {'Sign-Param': getSig()}
    }
    if (type.toUpperCase() === 'POST') {
        opt = {...opt, data: qs.stringify(params)}
    } else {
        opt = {...opt, params: params}
    }
    if (headers) {
        opt = {...opt, data: params, headers: headers}
    }
    axios({...opt}).then(function (response) {
        const data = response.data
        if (!data.code) {
            message.error('登陆状态失效, 请重新登陆!')
            deleteCookies()
            Cookies.set('loginStatus', false)
            hashHistory.push('/login')
            // return
        } else {
            fn.call(this, data)
        }
    }).catch(function (error) {
        fn.call(this, error)
        if (error.response) {
            if (/^(5)\d{2}/.test(error.response.status)) {
                message.error(`服务器异常 ${error.response.status}`)
            }
            if (/^(4)\d{2}/.test(error.response.status)) {
                message.error(`请求地址或参数异常 ${error.response.status}`)
            }
        } else if (error.request) {
            message.error('网络出现异常, 上传失败!')
        } else {
            message.error('Error', error.message)
        }
    })
}

export const postAjax = (type, url, params, fn) => {
    axios({
        method: type,
        url: url,
        data: params,
        headers: {'Sign-Param': getSig()}
    }).then(function (response) {
        const data = response.data
        if (data.status === 401) {
            message.warning(data.msg)
            hashHistory.push('/login')
        } else {
            fn.call(this, data)
        }
    }).catch(function (error) {
        fn.call(this, error)
        if (error.response) {
            if (/^(5)\d{2}/.test(error.response.status)) {
                message.error(`服务器异常 ${error.response.status}`)
            }
            if (/^(4)\d{2}/.test(error.response.status)) {
                message.error(`请求地址或参数异常 ${error.response.status}`)
            }
        } else if (error.request) {
            message.error('网络出现异常, 上传失败!')
        } else {
            message.error('Error', error.message)
        }
    })
}

export const axiosFormData = (type, url, params, fn) => {
    let _url = URL + url
    axios({
        method: type,
        url: _url,
        data: params,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Sign-Param': getSig()
        },
        timeout: 60000,
        onUploadProgress: function (progressEvent) {}
    }).then(function (response) {
        fn.call(this, response.data)
    }).catch(function (error) {
        fn.call(this, error)
        if (error.response) {
            if (/^(5)\d{2}/.test(error.response.status)) {
                message.error(`服务器异常 ${error.response.status}`)
            }
            if (/^(4)\d{2}/.test(error.response.status)) {
                message.error(`请求地址或参数异常 ${error.response.status}`)
            }
        } else if (error.request) {
            message.error('网络出现异常, 正在尝试重新上传!')
        } else {
            message.error('上传出现严重错误, 请刷新页面重新上传!')
        }
    })
}

export const getCrumbKey = (location) => {
    // const {location} = this.props
    let pathStr = location.pathname.substring(1)
    let arr = []
    if (pathStr.indexOf('-') !== -1) {
        let pathArr = pathStr.split('-')
        arr.push(pathArr[0])
        arr.push(pathStr)
    } else {
        arr.push(pathStr)
    }
    return arr
}

// 删除 cookies
export const deleteCookies = () => {
    let strcookie = document.cookie
    let arrcookie = strcookie.split('; ')
    for (let i = 0; i < arrcookie.length; i++) {
        let arr = arrcookie[i].split('=')
        if (arr[0].indexOf('hx_') !== -1) {
            Cookies.remove(arr[0])
        }
    }
}

/* 时间格式化 */
export const formatDate = (val, str) => {
    if (!val) {
        return 0
    }
    let _str = !str ? '-' : str
    let _time = new Date(val)
    let y = _time.getFullYear()
    let M = _time.getMonth() + 1
    let d = _time.getDate()
    let h = _time.getHours()
    let m = _time.getMinutes()
    let s = _time.getSeconds()
    return y + _str + add0(M) + _str + add0(d) + ' ' + add0(h) + ':' + add0(m) + ':' + add0(s)
}
const add0 = (m) => {
    return m < 10 ? '0' + m : m
}

// 超出字数显示省略号
export const cutString = (str, len) => {
    // length属性读出来的汉字长度为1
    if (str && str.length) {
        if (str.length * 2 <= len) {
            return str
        }
        let strlen = 0
        let s = ''
        for (let i = 0; i < str.length; i++) {
            s = s + str.charAt(i)
            if (str.charCodeAt(i) > 128) {
                strlen = strlen + 2
                if (strlen >= len) {
                    return s.substring(0, s.length - 1) + '...'
                }
            } else {
                strlen = strlen + 1
                if (strlen >= len) {
                    return s.substring(0, s.length - 2) + '...'
                }
            }
        }
        return s
    } else {
        return ''
    }
}

// 判断是否为对象字符串
export const isJsonString = (str) => {
    try {
        if (typeof JSON.parse(str) === 'object') {
            return true
        }
    } catch (e) {
        // console.log(e)
    }
    return false
}

// 空返回展示
export const emptyOrNot = (data, value) => {
    if (data && data.trim() !== '') {
        return data
    } else {
        return !value ? '暂无' : value
    }
}

// 生成全局唯一标识符
export const generateUUID = () => {
    let d = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
}

// 图片的 dataurl 转 blob
export const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type: mime})
}

// 快讯新老版本的标题和内容处理
export const getTitle = (text, pureText) => {
    let title = text.replace(/\r|\n|\\s/g, '')
    if (title.indexOf('【') !== -1 && title.indexOf('】') !== -1) {
        if (pureText) {
            return title.match(/【(.*)】/)[1]
        } else {
            return title.match(/【.*?】/)[0]
        }
    } else {
        return '【快讯】'
    }
}

export const getContent = (content) => {
    if (content.indexOf('【') !== -1 && content.indexOf('】') !== -1) {
        return content.split('】')[1]
    } else {
        return content
    }
}
// 转换数字格式
export const tranFormat = (num) => num.toString().replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')

// 新闻频道
export const channelIdOptions = [
    { label: '新闻', value: '1' },
    // { label: 'BTA专题', value: '12' },
    // { label: '两会', value: '10' },
    { label: '产业', value: '2' },
    { label: '项目', value: '3' },
    { label: '投资', value: '14' },
    { label: '人物', value: '4' },
    { label: '技术', value: '6' },
    { label: '挖矿', value: '13' },
    { label: '游戏', value: '7' },
    { label: '八点', value: '8' },
    { label: '周报', value: '15' },
    { label: '王峰十问', value: '9' },
    { label: '新手入门', value: '5' },
    { label: '其他', value: '-1' }
]

// 快讯频道
export const flashIdOptions = [
    {label: '安全', value: '6'},
    {label: '监管动态', value: '1'},
    {label: 'BTA专题', value: '5'},
    {label: '交易所公告', value: '2'},
    {label: '重大行情', value: '3'},
    {label: '观点', value: '4'},
    {label: '暂无', value: '0'}
]

// 快讯审核状态
export const flashAuditStatus = [
    {label: '全部', value: ''},
    {label: '待审核', value: '0'},
    {label: '审核通过', value: '1'},
    {label: '审核不通过', value: '2'}
]

// PC 端广告位置
export const pcAdPosition = [
    {label: '顶部 Banner(800 * 100)', value: '1'},
    {label: '首页新闻列表嵌入(800 * 140)', value: '8'},
    {label: '新首页右侧推广(100 * 100)', value: '10'},
    {label: '首页中部左侧', value: '2'},
    {label: '首页中部右侧', value: '3'},
    {label: '首页底部', value: '4'},
    {label: '首页轮播', value: '9'},
    {label: '新闻详情顶部', value: '5'},
    {label: '新闻详情底部', value: '6'},
    {label: '新闻详情侧边栏', value: '7'}
]

// 手机端广告位置
export const mobileAdPosition = [
    {label: '首页', value: '1'},
    {label: '新闻详情页', value: '2'},
    {label: '新闻列表嵌入', value: '3'},
    {label: 'APP启动页广告', value: '4'}
]

// 认证状态
export const auditStatus = [
    {label: '全部', value: ''},
    {label: '认证通过', value: '1'},
    {label: '待认证', value: '0'},
    {label: '认证不通过', value: '-1'},
    {label: '未认证', value: '-2'}
]

// 认证状态
export const icoStatusOptions = [
    {label: '已结束', value: 'past'},
    {label: '进行中', value: 'ongoing'},
    {label: '即将开始', value: 'upcoming'}
]

// 直播状态
export const liveStatusOptions = [
    {label: '已结束', value: '2'},
    {label: '进行中', value: '1'},
    {label: '即将开始', value: '0'}
]
// 专栏作者状态
export const authorTypeOptions = [
    { label: '全部推荐', value: '0' },
    { label: '置顶推荐', value: '1' },
    { label: '非置顶推荐', value: '2' }
]
// 新闻聚合账号状态
export const mergeTypeOptions = [
    { label: '禁止', value: '0' },
    { label: '正常', value: '1' },
    { label: '全部', value: '3' }
]

// 专题状态
export const topicStatusOptions = [
    {label: '全部', value: '1'},
    {label: '首页展示', value: '2'}
]

// 专题推荐状态
export const topicRecommendOptions = [
    {label: '全部', value: ''},
    {label: '推荐中', value: '1'}
]

// app 发现页轮播类型
export const topicTypeOptions = [
    {label: '跳转到链接', value: '1'},
    {label: '待定', value: '2'},
    {label: '跳转到新闻', value: '3'},
    {label: '跳转到作者', value: '5'}
]

// 网站首页轮播类型
export const bannerOptions = [
    {label: '新闻详情', value: '1'}, // 传 新闻 id, 网页中点击跳转到新闻详情
    {label: '新闻频道', value: '2'}, // 传新闻频道, 网页中点击跳转到某一类新闻列表页
    {label: '关键字/标签', value: '3'}, // 传新闻关键字, 网页中点击跳转到相关标签的新闻列表
    {label: '专题', value: '4'}, // 传专题名,  网页中点击跳转到专题页面
    {label: '作者信息', value: '5'}, // 传作者id, 网页中点击跳转到包含作者信息的新闻列表页
    {label: '广告', value: '6'}, // 纯链接, 直接跳转
    {label: '链接跳转', value: '7'}, // 纯链接, 直接跳转
    {label: '产品', value: '8'}, // 纯链接, 直接跳转
    {label: '活动', value: '9'} // 纯链接, 直接跳转
]

// 网站首页轮播类型
export const positionOptions = [
    {label: '首页顶部轮播(pc: 532 * 335; m: 640 * 320)', value: '1'},
    {label: '首页顶部右侧(250 * 160)', value: '2'},
    {label: '我的产品轮播(100 * 100)', value: '8'},
    {label: '推荐活动轮播(328 * 175)', value: '9'}
]

// 专题状态
export const bannerStatusOptions = [
    {label: '全部', value: ''},
    {label: ' 展示中', value: '1'},
    {label: '未展示', value: '0'}
]
