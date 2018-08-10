/**
 * Author：tantingting
 * Time：2017/9/19
 * Description：Description
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import { hashHistory } from 'react-router'
import { Form, Radio, Input, Button, message, Select, Spin, InputNumber, Icon, Upload, Modal } from 'antd'
import {getFlashItemInfo} from '../../actions/flash.action'

import {axiosAjax, flashIdOptions, URL, getSig} from '../../public/index'
import './flash.scss'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
const Option = Select.Option

const tagOptions = [
    { label: '普通', value: 1 },
    { label: '重要', value: 2 }
]

const trendOptions = [
    { label: '利好', value: 1 },
    { label: '利空', value: 0 }
]

class FlashSend extends Component {
    constructor () {
        super()
        this.state = {
            previewVisible: false,
            previewImage: '',
            imageList: [],
            images: '',
            updateOrNot: false,
            inputVisible: false,
            channelId: '1',
            inputValue: '',
            content: '',
            imagesRemark: '',
            loading: true,
            tag: 1,
            trend: 1,
            upCounts: 0,
            downCounts: 0,
            url: ''
        }
    }

    componentWillMount () {
        const {dispatch, location} = this.props
        if (location.query.id) {
            dispatch(getFlashItemInfo({'id': location.query.id}, (data) => {
                let imageList = data.images && data.images !== '' ? [{
                    uid: 0,
                    name: 'xxx.png',
                    status: 'done',
                    url: data.images
                }] : []
                this.setState({
                    content: data.content,
                    imagesRemark: data.imagesRemark,
                    url: data.url,
                    updateOrNot: true,
                    loading: false,
                    imageList: imageList,
                    images: data.images
                })
            }))
        } else {
            this.randomNum(true)
            this.setState({
                loading: false
            })
        }
    }

    // 频道改变
    channelIdChange = (value) => {
        this.setState({
            channelId: value
        })
    }

    // 状态改变
    tagChange = (e) => {
        this.setState({
            tag: e.target.value
        })
    }

    // 趋势改变
    trendChange = (e) => {
        this.setState({
            trend: e.target.value
        })
        this.randomNum(e.target.value)
    }

    // 生成两个随机数
    randomNum = (up) => {
        let num1 = Math.floor(Math.random() * 30 + 1)
        let num2 = Math.floor(Math.random() * 30 + 1)
        if (num1 === num2) num2 -= 1
        let max = Math.max(num1, num2)
        let min = Math.min(num1, num2)
        if (up) {
            this.setState({
                upCounts: max,
                downCounts: min
            })
        } else {
            this.setState({
                upCounts: min,
                downCounts: max
            })
        }
    }

    // 提交
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.setFieldsValue({
            images: this.state.images
        })
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                })
                values.title = ''
                values.id = this.props.location.query.id || ''
                !this.state.updateOrNot && delete values.id
                axiosAjax('post', `${this.state.updateOrNot ? '/lives/update' : '/lives/add'}`, values, (res) => {
                    this.setState({
                        loading: false
                    })
                    if (res.code === 1) {
                        message.success(this.state.updateOrNot ? '修改成功！' : '添加成功！')
                        hashHistory.push('/flash-lists')
                    } else {
                        message.error(res.msg)
                    }
                })
            }
        })
    }

    // 上传图片
    handleCancel = () => this.setState({previewVisible: false})

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        })
    }

    // m 封面
    handleMImgChange = ({file, fileList}) => {
        this.setState({
            imageList: fileList
        })

        if (file.status === 'removed') {
            this.setState({
                images: ''
            })
        }

        if (file.response) {
            if (file.response.code === 1 && file.status === 'done') {
                this.setState({
                    images: file.response.obj
                })
            }
            if (file.status === 'error') {
                message.error('网络错误，上传失败！')
                this.setState({
                    images: '',
                    imageList: []
                })
            }
        }
    }

    render () {
        const { getFieldDecorator } = this.props.form
        const { flashInfo } = this.props
        const { imagesRemark, content, updateOrNot, tag, trend, imageList, previewVisible, previewImage, upCounts, downCounts } = this.state
        const formItemLayout = {
            labelCol: { span: 1 },
            wrapperCol: { span: 18, offset: 1 }
        }

        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">上传图片</div>
            </div>
        )

        return <div className="flash-send">
            <Spin spinning={this.state.loading} size="large">
                <Form onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label="频道：">
                        {getFieldDecorator('channelId', {
                            initialValue: (updateOrNot && flashInfo) ? `${flashInfo.channelId}` : '0'
                        })(
                            <Select
                                style={{width: 120}}
                                setFieldsValue={this.state.channelId}
                                onChange={this.channelIdChange}
                            >
                                {flashIdOptions.map(d => <Option value={d.value} key={d.value}>{d.label}</Option>)}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="标识：">
                        {getFieldDecorator('tag', {
                            initialValue: (updateOrNot && flashInfo) ? (flashInfo.tag === 0 ? 1 : flashInfo.tag) : 1,
                            rules: [{ required: true, message: '请选择快讯标识！' }]
                        })(
                            <RadioGroup
                                options={tagOptions}
                                onChange={this.tagChange}
                                setFieldsValue={tag}>
                            </RadioGroup>
                        )}
                    </FormItem>

                    {updateOrNot ? '' : <FormItem {...formItemLayout} label="趋势：">
                        {getFieldDecorator('trend', {
                            initialValue: (updateOrNot && flashInfo) ? (flashInfo.trend && flashInfo.trend === 2 ? 2 : 1) : 1,
                            rules: [{ required: true, message: '请选择利好/利空趋势！' }]
                        })(
                            <RadioGroup
                                options={trendOptions}
                                onChange={this.trendChange}
                                setFieldsValue={trend}>
                            </RadioGroup>
                        )}
                    </FormItem>}

                    <FormItem {...formItemLayout} label="利好数：">
                        {getFieldDecorator('upCounts', {
                            initialValue: (updateOrNot && flashInfo) ? (flashInfo.upCounts || 0) : upCounts
                        })(
                            <InputNumber />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="利空数：">
                        {getFieldDecorator('downCounts', {
                            initialValue: (updateOrNot && flashInfo) ? (flashInfo.downCounts || 0) : downCounts
                        })(
                            <InputNumber />
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="链接：">
                        {getFieldDecorator('url', {
                            initialValue: (updateOrNot && flashInfo) ? `${flashInfo.url ? flashInfo.url : ''}` : '',
                            rules: [{ type: 'url', message: '请输入正确的超链接地址！' }]
                        })(
                            <Input placeholder='快讯中插入的超链接地址'/>
                        )}
                    </FormItem>

                    {/*
                     <FormItem {...formItemLayout} label="标题：">
                     {getFieldDecorator('title', {
                     initialValue: (updateOrNot && flashInfo) ? `${!flashInfo.title ? getTitle(content, true) : flashInfo.title}` : '',
                     rules: [
                     { required: true, message: '请输入快讯标题！' },
                     { pattern: /^((?!【|】).)*$/, message: '标题格式有误！' }
                     ]
                     })(
                     <Input placeholder='快讯标题，请勿添加括号'/>
                     )}
                     </FormItem>
                     */}

                    <FormItem
                        {...formItemLayout}
                        label="内容："
                    >
                        {getFieldDecorator('content', {
                            initialValue: (updateOrNot && flashInfo) ? content : '',
                            rules: [
                                { required: true, message: '请输入快讯内容！' }
                                // { pattern: /^((?!【|】).)*$/, message: '内容格式有误！' }
                            ]
                        })(
                            <TextArea className="flash" rows={10} placeholder="快讯内容"/>
                        )}
                    </FormItem>

                    {/*
                     <FormItem
                     {...formItemLayout}
                     label="内容："
                     >
                     {getFieldDecorator('content', {
                     initialValue: (updateOrNot && flashInfo) ? getContent(content) : '',
                     rules: [
                     { required: true, message: '请输入快讯内容！' },
                     { pattern: /^((?!【|】).)*$/, message: '内容格式有误！' }
                     ]
                     })(
                     <TextArea className="flash" rows={4} placeholder="快讯内容"/>
                     )}
                     </FormItem>
                     */}

                    <FormItem
                        {...formItemLayout}
                        label="配图: "
                        className='upload-div'
                    >
                        <div className="dropbox">
                            {getFieldDecorator('images', {
                                initialValue: (updateOrNot && flashInfo) ? imageList : ''
                            })(
                                <Upload
                                    headers={{'Sign-Param': getSig()}}
                                    action={`${URL}/pic/upload`}
                                    name='uploadFile'
                                    listType="picture-card"
                                    fileList={imageList}
                                    onPreview={this.handlePreview}
                                    onChange={this.handleMImgChange}
                                >
                                    {imageList.length >= 1 ? null : uploadButton}
                                </Upload>
                            )}
                            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                <img alt="example" style={{width: '100%'}} src={previewImage}/>
                            </Modal>
                            <span className="cover-img-tip">用于快讯的图片展示, 建议比例: <font style={{color: 'red'}}>750 * 500</font></span>
                        </div>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="注释："
                    >
                        {getFieldDecorator('imagesRemark', {
                            initialValue: (updateOrNot && flashInfo) ? imagesRemark : '',
                            rules: [{ required: this.state.images !== '' ? 1 : 0, message: '请输入图片注释！' }]
                        })(
                            <Input placeholder='图片注释'/>
                        )}
                    </FormItem>

                    <FormItem
                        wrapperCol={{ span: 24 }}
                        style={{textAlign: 'center'}}
                    >
                        <Button type="primary" htmlType="submit" style={{marginRight: '40px'}}>发表</Button>
                        <Button type="primary" className="cancel" onClick={() => { hashHistory.goBack() }}>取消</Button>
                    </FormItem>
                </Form>
            </Spin>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.flashInfo.userInfo,
        flashInfo: state.flashInfo.info
    }
}

export default connect(mapStateToProps)(Form.create()(FlashSend))
