const path = require('path');
const config = require('./config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取CSS为独立的文件 extracts CSS into separate files.
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const resolvePath = (dir) => {
    return path.resolve(__dirname, '../', dir);
};

let baseConfig = {
    entry: config.entries, // 入口文件 src/pages/**/*.js
    output: {
        path: config.distRootPath, // dist/
        // publicPath: resolvePath(config.publicPath),
        filename: '[name].[hash:7].js', //
    },
    resolve: {
        extensions: ['.js', '.scss', '.json', '.vue'], // 自动解析后缀, 引入文件时无需写后缀
        modules: [ // webpack解析模块搜索的目录
            "node_modules",
            resolvePath('lib')
        ],
        alias: { // 别名, 缩短引用路径
            'vue$': 'vue/dist/vue.runtime.js',
            'src': resolvePath('src'),
            'components': resolvePath('src/components')
        }
    },
    performance: { // https://www.webpackjs.com/configuration/performance/
        maxAssetSize: 400000,
        maxEntrypointSize: 800000 // 先改大点没有警告, 动态加载后会变小
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: ['vue-loader']
            },
            {
                test: /\.js$/,  // 它会应用到普通的 `.js` 文件, 以及 `.vue` 文件中的 `<script>` 块
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [
                    resolvePath('build'),
                    resolvePath('demo'),
                    resolvePath('src'),
                    resolvePath('lib')
                ]
            },
            {
                test: /\.(c|sa|sc)ss$/, //它会应用到普通的 `.css|.sass|.sacc` 文件,以及 `.vue` 文件中的 `<style>` 块
                use: [
                    process.env.NODE_ENV !== 'production' ? 'vue-style-loader' : MiniCssExtractPlugin.loader, // 请只在生产环境下使用 CSS 提取，这将便于你在开发环境下进行热重载
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 0,
                            name: 'assets/[name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(ttf|woff2?|eot)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        query: {
                            limit: 10000,
                            name: 'assets/fonts/[name].[hash:7].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-compiled-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },
    optimization: {
        splitChunks: { // https://webpack.docschina.org/plugins/split-chunks-plugin/
            chunks: 'all',
            minSize: 30000, // 生成trunk的最小大小, 小于30kb则不会被分离
            maxSize: 0, // 生产的bundle大于这个值, 便再次分割
            minChunks: 1, // 模块被引用>=1次，便分割
            maxAsyncRequests: 5, // 异步加载chunk的并发请求数量<=5
            maxInitialRequests: 2, // 一个入口并发加载的chunk数量<=2
            name: false,
            cacheGroups: { // 缓存组，会继承和覆盖splitChunks的配置
                default: false, // 禁用默认配置
                vendors: {
                    name: 'vendor',
                    chunks: 'initial', // initial(初始模块)、async(按需加载模块)和all(全部模块)
                    reuseExistingChunk: true, // 默认使用已有的模块
                    minChunks: Object.keys(config.entries).length, // 被所有页面都引用, 才会被抽离为公共模块
                    test: /[\\/](node_modules)|(lib)|(src[\\/]commons)[\\/]/ // 只拆分node_modules和lib和src/commons中的模块
                }
            }
        },
        runtimeChunk: { // 提取webpack运行时代码 https://webpack.docschina.org/configuration/optimization/#optimization-runtimechunk
            name: 'manifest'
        }
    },
    plugins: [
        new ProgressBarWebpackPlugin(), // 编译时展示一个进度条
        new VueLoaderPlugin(), // Vue Loader 是一个 webpack 的 loader，它允许你以一种名为单文件组件 (SFCs)的格式撰写 Vue 组件 (https://vue-loader.vuejs.org)
        // new BundleAnalyzerPlugin()
    ]
};

// 文件夹与entry对应关系
const dirEntryMap = {
    'details': 'app'
};

let pages = Object.keys(config.entries);
pages.forEach(item => {
    if (item.indexOf('\/commons\/') === -1) {
        baseConfig.plugins.push(new HtmlWebpackPlugin({
            filename: resolvePath(`dist/${item}.html`),
            template: resolvePath(`src/pages/${item}.ejs`),
            chunks: ['manifest', 'vendor', item]
        }));
    }
});

module.exports = baseConfig;
