const path = require('path');
const glob = require('glob');
const config = require('./config');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const resolvePath = (dir) => {
    return path.resolve(__dirname, '../', dir);
};

let baseConfig = {
    entry: {
        app: resolvePath('src/pages/index.js')
    },
    output: {
        path: config.distOldRootPath,
        // publicPath: resolvePath(config.publicPath),
        filename: '[name].[hash:7].js',
    },
    resolve: {
        extensions: ['.js', '.scss', '.json', '.vue'],
        modules: [
            "node_modules",
            resolvePath('lib')
        ],
        alias: {
            'vue$': 'vue/dist/vue.runtime.js',
            'src': resolvePath('src'),
            'components': resolvePath('src/components')
        }
    },
    performance: { // https://www.webpackjs.com/configuration/performance/
        maxEntrypointSize: 900000,
        maxAssetSize: 700000
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
                loader: 'ejs-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
            }
        }
    },
    plugins: [
        new ProgressBarWebpackPlugin(), // 编译时展示一个进度条
        new VueLoaderPlugin(), // Vue Loader 是一个 webpack 的 loader，它允许你以一种名为单文件组件 (SFCs)的格式撰写 Vue 组件 (https://vue-loader.vuejs.org)
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
        // new BundleAnalyzerPlugin()
    ]
};

// 文件夹与entry对应关系
const dirEntryMap = {
    'details': 'app'
    // 'ipad_details': 'ipad_app'
};
let templates = glob.sync(resolvePath('src/pages/*/*.ejs'));
templates.forEach((template, index) => {
    let chunkName = template.match(/src\/pages\/(.*)\.ejs$/)[1];
    let dir = 'details';
    let chunk = dirEntryMap[dir];
    if (!chunk) {
        throw new Error('未找到文件夹对应的entry');
    };
    let chunks = [chunk];
    baseConfig.plugins.push(new HtmlWebpackPlugin({
        filename: chunkName + '.html',
        template: template,
        inject: true,
        chunks: chunks,
        chunkSortMode: 'dependency'
    }));
});


module.exports = baseConfig;
