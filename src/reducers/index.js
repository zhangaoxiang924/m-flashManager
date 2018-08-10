/**
 * Author：zhoushuanglong
 * Time：2017/7/27
 * Description：root reducer
 */

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import loginInfo from './loginInfo'
import flashInfo from './flash.reducer'
import languageInfo from './language.reducer'
import authorityInfo from './authority.reducer'
const reducers = Object.assign({
    loginInfo,
    flashInfo,
    languageInfo,
    authorityInfo,
    routing: routerReducer
})

const rootReducer = combineReducers(reducers)
export default rootReducer
