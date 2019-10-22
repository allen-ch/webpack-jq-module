const path = require('path');
const glob = require('glob');

const envConfig = {
    NODE_ENV: process.env.NODE_ENV
};

// 获取入口文件
let entries = (entryPath => {
    let files = {};
    filesPath = glob.sync(`${entryPath}/*/*.js`, {
        ignore: [`${entryPath}/details/*.js`]
    });
    filesPath.forEach((entry, index) => {
        let chunkName = path.relative(entryPath, entry).replace(/\.js$/i, '');
        files[chunkName] = path.resolve(__dirname, '../', entry);
    });
    return files;
})('src/pages');

module.exports = {
    entries: entries,
    projectRootPath: path.resolve(__dirname, '../'),
    distRootPath: path.resolve(__dirname, '../dist'),
    distOldRootPath: path.resolve(__dirname, '../dist_old'),
    assetsRootPath: path.resolve(__dirname, '../src/assets'),
    nodePath: path.resolve(__dirname, '../node_modules'),
    libPath: path.resolve(__dirname, '../lib'),
    publicPath: '/',
    absolutePath: '/',
    indexPath: 'index.html',
    env: envConfig,
    server: {
        port: 8086
    }
};
