const webpack = require('webpack');
const path = require('path');
const argv = require('yargs').argv;
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./config');
let baseConfig;
let outDir;
const ManifestPlugin = require('webpack-manifest-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
if(process.env.type === 'single') {
    baseConfig  = require('./webpack.old.base.conf');
    outDir = 'dist_old'
}else {
    baseConfig  = require('./webpack.base.conf');
    outDir = 'dist'
}
let debugMode = argv.env === 'dev';
let prodConfig = merge(baseConfig, {
    mode: 'production',
    devtool: debugMode ? 'source-map' : '', // 测试环境生成source map
    output: {
        publicPath: config.absolutePath,
        filename: '[name].[chunkhash:7].js',
        chunkFilename: '[name].[chunkhash:7].js'
    },
    stats: { // https://webpack.docschina.org/configuration/stats/
        colors: true,
        chunks: false,
        children: false,
        entrypoints: false,
        modules: false,
        timings: true,
        version: true,
        warnings: true,
        errors: true,
    },
    optimization: {
        moduleIds: 'hashed',
        chunkIds : 'named',
        minimizer: [
            // 压缩CSS
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css$/g, // 正则匹配后缀.css文件;
                cssProcessor: require('cssnano'), // 指定处理css的库
                cssProcessorOptions: {
                    safe: true,
                    autoprefixer: false, // https://cssnano.co/optimisations/autoprefixer
                    discardComments: {  // 删除注释
                        removeAll: true
                    }
                },
                canPrint: true // 设置是否可以向控制台打日志,默认为true;
            }),
            // 压缩JS
            new UglifyJsPlugin({
                test: /\.js$/,
                cache: true, // 启用文件缓存,提高打包速度
                parallel: true, // 多线程,提高打包速度
                uglifyOptions: {
                    compress: {
                        drop_debugger: true, // 删除debugger
                        drop_console: true, // 删除console
                        unused: true // 删除未引用的方法和变量
                    }
                }
            })
        ]
    },
    plugins: [
        // 打包前删除dist文件夹
        new CleanWebpackPlugin([outDir], {
            root: config.projectRootPath,
            verbose: false, // 输出log到控制台
            dry: false // 模拟删除
        }),
        // 生成manifest.json资源清单文件
        new ManifestPlugin({
            fileName: 'manifest.json',
            publicPath: '',
            filter: (FileDescriptor) => {
                // 只输出chunk, 不输出其他图片乱七八糟的
                if (FileDescriptor && FileDescriptor.isChunk) {
                    return FileDescriptor;
                }
            }
        }),
        // 提取CSS
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:7].css'
        }),
    ]
});

// 生产环境npm run build不带:debug, 压缩css和js
if (debugMode) {
    prodConfig.optimization.minimizer = [];
}

module.exports = prodConfig;
