/**
 * Author：tantingting
 * Time：2017/9/19
 * Description：Description
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button, message, Modal, Spin } from 'antd'
import { hashHistory } from 'react-router'
// import IconItem from '../../components/icon/icon'
import {getFlashItemInfo} from '../../actions/flash.action'
import {axiosAjax, flashIdOptions, getContent, getTitle} from '../../public/index'
import './flash.scss'
const confirm = Modal.confirm

class FlashDetail extends Component {
    constructor () {
        super()
        this.state = {
            'isEdit': false,
            loading: true,
            previewImage: '',
            previewVisible: false
        }
    }
    componentWillMount () {
        const {dispatch, location} = this.props
        dispatch(getFlashItemInfo({'id': location.query.id}, () => {
            this.setState({
                loading: false
            })
        }))
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

    // 删除
    _delFlash () {
        const {location} = this.props
        // const _this = this
        confirm({
            title: '提示',
            content: `确认要删除吗 ?`,
            onOk () {
                let sendData = {
                    status: -1,
                    'id': location.query.id
                }
                axiosAjax('POST', '/lives/status', {...sendData}, (res) => {
                    if (res.code === 1) {
                        message.success('删除成功')
                        hashHistory.goBack()
                    } else {
                        message.error(res.msg)
                    }
                })
            }
        })
    }

    // 内容格式化
    createMarkup (str) { return {__html: str} }

    edit = () => {
        const {info} = this.props
        hashHistory.push({
            pathname: '/flash-edit',
            query: {id: info.id}
        })
    }

    handlePreview = (file) => {
        this.setState({
            previewVisible: true
        })
    }

    handleCancel = () => this.setState({previewVisible: false})

    render () {
        const col = {
            lg: {
                span: 6
            },
            md: {
                span: 11,
                offset: 1
            }
        }
        const {info} = this.props
        return <div className="flash-detail">
            <Spin spinning={this.state.loading} size="large">
                <Row>
                    <Col span={1}>
                        <Button shape="circle" icon="arrow-left" onClick={() => hashHistory.goBack()} />
                    </Col>
                    <Col className="text-right" span={20} offset={3}>
                        <Button size="small" onClick={this.edit} className="mr10" type="primary" >编辑</Button>
                        <Button size="small" onClick={() => this._delFlash()}>删除</Button>
                    </Col>
                </Row>
                <Row className="news-detail-info">
                    <Col className="section" {...col}>
                        <span className="name">频道：</span>
                        <span className="desc">{`${this.channelName(info.channelId)}`} </span>
                    </Col>
                    <Col className="section" {...col}>
                        <span className="name">标识：</span>
                        <span className="desc">{`${(parseInt(info.tag) === 1 || parseInt(info.tag) === 0) ? '普通' : '重要'}`} </span>
                    </Col>
                    <Col className="section" {...col}>
                        <span className="name">趋势：</span>
                        <span className="desc">{info.upCounts > info.downCounts ? '利好' : '利空'}</span>
                    </Col>
                    <Col className="section" {...col}>
                        <span className="name">利好数：</span>
                        <span className="desc">{info.upCounts || 0} </span>
                    </Col>
                    <Col className="section" {...col}>
                        <span className="name">利空数：</span>
                        <span className="desc">{info.downCounts || 0}</span>
                    </Col>
                </Row>
                <Row className="">
                    <Col className="section" {...col}>
                        <span className="name">标题：</span>
                        <span className="content-text desc" dangerouslySetInnerHTML={this.createMarkup(info.title && info.title.trim() !== '' ? info.title : getTitle(info.content || '', true))} />
                    </Col>
                </Row>
                {info.images && info.images !== '' && <Row className="imgs">
                    <Col className="section" {...col}>
                        <span className="name">配图：</span>
                        <img style={{width: 100, marginLeft: 5}} onClick={this.handlePreview} src={info.images} />
                    </Col>
                </Row>}
                <Row>
                    <Col className="section" {...col}>
                        <span className="name">内容：</span>
                        <div className="desc">
                            <span className="content-text" dangerouslySetInnerHTML={this.createMarkup(getContent(info.content || ''))} />
                            {info.url && info.url !== '' && <a href={info.url} target="_blank"> 「查看原文」</a>}
                        </div>
                    </Col>
                </Row>
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="快讯" style={{width: '100%'}} src={info.images}/>
                </Modal>
            </Spin>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        info: state.flashInfo.info
    }
}

export default connect(mapStateToProps)(FlashDetail)
