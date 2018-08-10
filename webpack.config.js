const {resolve} = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const autoprefixer = require('autoprefixer')
const OpenBrowserWebpackPlugin = require('open-browser-webpack-plugin')

const ROOT_PATH = resolve(__dirname)
const SRC_PATH = resolve(ROOT_PATH, 'src')
const DIST_PATH = resolve(ROOT_PATH, 'dist')
const LIBS_PATH = resolve(ROOT_PATH, 'libs')
const TEM_PATH = resolve(LIBS_PATH, 'template')

module.exports = {
    devtool: 'source-map',
    entry: {
        index: resolve(SRC_PATH, 'index.jsx')
    },
    output: {
        path: DIST_PATH,
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                include: SRC_PATH,
                use: [
                    'babel-loader',
                    'eslint-loader'
                ]
            }, {
                test: /\.(css|scss)?$/,
                include: ROOT_PATH,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [autoprefixer()]
                        }
                    },
                    'sass-loader'
                ]
            }, {
                test: /\.(png|jpg|jpeg|gif|svg|svgz)?$/,
                include: SRC_PATH,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.scss']
    },
    externals: {
        zepto: '$',
        jquery: '$'
    },
    plugins: [
        new StyleLintPlugin(),
        new webpack.ProvidePlugin({
            $: 'zepto' || 'jquery',
            zepto: 'zepto',
            jQuery: 'jquery',
            'window.zepto': 'zepto',
            'window.jQuery': 'jquery'
        }),
        new HtmlWebpackPlugin({
            title: '火星财经管理后台',
            filepath: DIST_PATH,
            template: resolve(TEM_PATH, 'index.html'),
            chunks: ['index'],
            filename: 'index.html',
            inject: 'body'
        }),
        new OpenBrowserWebpackPlugin({url: 'http://192.168.84.44:3011'})
    ],
    devServer: {
        inline: true,
        hot: true,
        historyApiFallback: true,
        contentBase: ROOT_PATH,
        host: '192.168.84.44',
        port: '3011',
        proxy: [{
            context: ['/*/*/*'],
            // target: 'http://admin.huoxing24.com',
            target: 'http://www.huoxing24.vip',
            // target: 'http://192.168.84.14:8002',
            changeOrigin: true,
            ws: true,
            secure: false
        }, {
            context: ['/*/*/*/*'],
            // target: 'http://admin.huoxing24.com',
            target: 'http://www.huoxing24.vip',
            // target: 'http://192.168.84.14:8002',
            changeOrigin: true,
            ws: true,
            secure: false
        }, {
            context: ['/*/*/*/*/*'],
            // target: 'http://admin.huoxing24.com',
            target: 'http://www.huoxing24.vip',
            // target: 'http://192.168.84.14:8002',
            changeOrigin: true,
            ws: true,
            secure: false
        }]
    }
}
