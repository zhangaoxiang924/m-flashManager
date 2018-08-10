/**
 * Author：zhoushuanglong
 * Time：2017/7/27
 * Description：menu data
 * , {
        key: 'postUser',
        icon: 'icon-postUser',
        link: '/postUser',
        text: '用户管理'
    }, {
        key: 'images',
        icon: 'icon-images',
        link: '/images',
        text: '图片鉴别'
    }, {
        key: 'language',
        icon: 'icon-language',
        link: '/language',
        text: '多语言词条管理'
    }
 */
const menuData = [
    {
        key: 'flash',
        icon: 'icon-flash',
        link: '',
        text: '快讯管理',
        children: [
            {
                key: 'flash-lists',
                icon: 'icon-flash-list',
                link: '/flash-lists',
                text: '快讯列表'
            }, {
                key: 'flash-edit',
                icon: 'icon-flash-send',
                link: '/flash-edit',
                text: '快讯添加/编辑'
            }
        ]
    }
]
export default menuData
