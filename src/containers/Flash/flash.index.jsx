/**
 * Author：tantingting
 * Time：2017/9/19
 * Description：Description
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Modal, message, Spin, Button, Input } from 'antd'
import './flash.scss'
import { hashHistory } from 'react-router'
import {getFlashList, setSearchQuery, setPageData} from '../../actions/flash.action'
import {formatDate, axiosAjax, cutString, flashIdOptions, getTitle, getContent} from '../../public/index'
const confirm = Modal.confirm
let columns = []
class FlashIndex extends Component {
    constructor () {
        super()
        this.state = {
            loading: true
        }
    }

    channelName (id) {
        let name = ''
        flashIdOptions.map((item, index) => {
            if (parseInt(item.value) === id) {
                name = item.label
            }
        })
        return name
    }

    componentWillMount () {
        const {search} = this.props
        if (this.props.list.length === 0) {
            this.doSearch(!search.type ? 'init' : search.type)
        } else {
            this.state = {
                loading: false
            }
        }
        columns = [{
            title: '快讯',
            key: 'content',
            render: (text, record) => {
                return <div className="flash-info clearfix">
                    <div onClick={() => {
                        hashHistory.push({
                            pathname: '/flash-detail',
                            query: {id: record.id}
                        })
                    }}>
                        <p style={{fontSize: 14}}>{formatDate(record.createdTime)}</p>
                        <h3>{!record.title ? getTitle(record.content) : `【${record.title}】`}{cutString(getContent(record.content), 70)}</h3>
                    </div>
                    <Button
                        className="mr10"
                        type="primary"
                        size="small"
                        onClick={() => {
                            hashHistory.push({
                                pathname: '/flash-edit',
                                query: {id: record.id}
                            })
                        }}>编辑</Button>
                    <Button
                        className="mr10"
                        type="primary"
                        size="small"
                        onClick={() => this.delFlash(record)}>
                        删除
                    </Button>
                </div>
            }
        }]
    }

    createMarkup (str) { return {__html: str} }

    doSearch (type, data) {
        $('html').stop().animate({'scrollTop': 0}, 300)
        this.setState({
            loading: true
        })
        const {dispatch, pageData, search} = this.props
        let sendData = {
            'title': search.title,
            'currentPage': pageData.currPage
        }
        sendData = {...sendData, ...data}
        dispatch(getFlashList(type, sendData, () => {
            this.setState({
                loading: false
            })
        }))
    }
    _search () {
        const {dispatch} = this.props
        this.doSearch('init', {'currentPage': 1})
        dispatch(setPageData({'currPage': 1}))
    }
    changePage (page) {
        this.setState({
            loading: true
        })
        const {dispatch, search} = this.props
        // this.setState({'currPage': page})
        dispatch(setPageData({'currPage': page}))
        this.doSearch(search.type, {'currentPage': page})
    }
    // 删除
    delFlash (item) {
        const {dispatch} = this.props
        const _this = this
        confirm({
            title: '提示',
            content: `确认要删除吗 ?`,
            onOk () {
                let sendData = {
                    // 'appId': $.cookie('gameId'),
                    id: item.id,
                    status: -1
                }
                axiosAjax('POST', '/lives/status', {...sendData}, (res) => {
                    if (res.code === 1) {
                        message.success('删除成功')
                        _this.doSearch('init')
                        dispatch(setSearchQuery({'type': 'init'}))
                    } else {
                        message.error(res.msg)
                    }
                })
            }
        })
    }

    // 禁评、取消禁评
    _forbidcomment (item) {
        const {dispatch} = this.props
        let sendData = {
            // 'appId': $.cookie('gameId'),
            'id': item.id,
            'operate': !parseInt(item.forbidComment) ? '1' : '0'
        }
        axiosAjax('post', '/post/forbidcomment', sendData, (res) => {
            if (res.status === 200) {
                this.doSearch('init')
                dispatch(setSearchQuery({'type': 'init'}))
            } else {
                message.error(res.msg)
            }
        })
    }

    render () {
        const {list, pageData, search, dispatch} = this.props
        return <div className="flash-index">
            <Input
                onPressEnter={() => { this._search() }}
                value={search.title}
                style={{width: '60%', marginRight: 10}}
                onChange={(e) => dispatch(setSearchQuery({title: e.target.value}))}
                placeholder="请输入要搜索的内容"
            />
            <Button type="primary" size='small' style={{padding: 0, marginRight: 10, width: '15%'}} onClick={() => { this._search() }}>搜索</Button>
            <Button type="primary" size='small' style={{padding: 0, width: '15%'}} onClick={() => { hashHistory.push('/flash-edit') }}>新增</Button>
            <div style={{marginTop: 15}}>
                <Spin spinning={this.state.loading} size="default">
                    <Table
                        showHeader={false}
                        dataSource={list.map((item, index) => ({...item, key: index}))}
                        columns={columns}
                        bordered
                        pagination={{
                            size: 'middle',
                            current: pageData.currPage,
                            total: pageData.totalCount,
                            pageSize: pageData.pageSize,
                            onChange: (page) => this.changePage(page)
                        }}
                    />
                </Spin>
            </div>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        flashInfo: state.flashInfo,
        list: state.flashInfo.list,
        search: state.flashInfo.search,
        pageData: state.flashInfo.pageData
    }
}

export default connect(mapStateToProps)(FlashIndex)
