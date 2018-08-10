/**
 * Author：zhoushuanglong
 * Time：2017/7/27
 * Description：root route
 */

import React from 'react'
import {Route, IndexRoute} from 'react-router'
function isLogin (nextState, replace) {
    let loginStatus = $.cookie('loginStatus')
    if (!loginStatus || !$.parseJSON(loginStatus)) {
        replace('/login')
    }
}
const rootRoutes = <div>
    <Route path="/" onEnter={isLogin} getComponent={(nextState, callback) => {
        require.ensure([], (require) => {
            callback(null, require('../containers/Main').default)
        }, 'HasHeader')
    }}>
        <IndexRoute getComponent={(nextState, callback) => {
            require.ensure([], (require) => {
                callback(null, require('../containers/Flash/flash.index').default)
            }, 'Enter')
        }}/>
        <Route path='/enter' getComponent={(nextState, callback) => {
            require.ensure([], (require) => {
                callback(null, require('../containers/Enter').default)
            }, 'Enter')
        }}/>
    </Route>
    <Route path="/" onEnter={isLogin} getComponent={(nextState, callback) => {
        require.ensure([], (require) => {
            callback(null, require('../containers/Main').default)
        }, 'Main')
    }}>
        {/* 快讯 */}
        <Route path='/flash-lists' getComponent={(nextState, callback) => {
            require.ensure([], (require) => {
                callback(null, require('../containers/Flash/flash.index').default)
            }, 'FlashIndex')
        }}/>
        <Route path='/flash-detail' getComponent={(nextState, callback) => {
            require.ensure([], (require) => {
                callback(null, require('../containers/Flash/flash.detail').default)
            }, 'FlashDetail')
        }}/>
        <Route path='/flash-edit' getComponent={(nextState, callback) => {
            require.ensure([], (require) => {
                callback(null, require('../containers/Flash/flash.send').default)
            }, 'FlashSend')
        }}/>
    </Route>
    <Route path='/login' getComponent={(nextState, callback) => {
        require.ensure([], (require) => {
            callback(null, require('../containers/Login').default)
        }, 'Login')
    }}/>
</div>

export default rootRoutes
