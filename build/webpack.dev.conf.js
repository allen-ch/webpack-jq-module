const path = require('path');
const open = require('open');
const merge = require('webpack-merge');
const argv = require('yargs').argv;
let baseWebpackConfig;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./config');
if(process.env.type === 'single') {
    baseWebpackConfig  = require('./webpack.old.base.conf');
}else {
    baseWebpackConfig  = require('./webpack.base.conf');
}

let port = argv.port || config.server.port;
let devConfig = merge(baseWebpackConfig, {
    devtool: 'cheap-eval-source-map',
    devServer: {
        host: '::',
        contentBase: config.distRootPath,
        watchContentBase: true,
        disableHostCheck: true,
        compress: true,
        port: port,
        overlay: {
            warnings: false,
            errors: true
        },
        stats: {
            colors: true,
            chunks: false,
            children: false,
            entrypoints: false,
            modules: false
        },
        before: function (app, server) {
            app.get('/', (req, res) => {
                var resHtml = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>index</title>
                </head>
                <body>
                    <ul>`;
                for (let key in config.entries) {
                    if (key.indexOf('\/commons\/') === -1) {
                        resHtml += `<li><a href="${key}.html">${key}.html</a></li>`;
                    }
                }
                resHtml += `</ul>
                </body>
                </html>`;
                res.send(resHtml);
            });

            const chokidar = require('chokidar');
            const files = [
                path.join(__dirname, '../src/pages/**/*.ejs'),
                path.join(__dirname, '../src/pages/**/*.vue')
            ];
            const options = {
                followSymlinks: false,
                depth: 5
            };
            let watcher = chokidar.watch(files, options);

            watcher.on('all', _ => {
                server.sockWrite(server.sockets, 'content-changed');
            });
        },
        after: function () {
            open(`http://localhost:${port}`);
        }
    },
    module: {
        rules: [

        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ]
});

module.exports = devConfig;
