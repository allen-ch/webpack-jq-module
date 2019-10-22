module.exports = {
    plugins: [
        // https://github.com/browserslist/browserslist
        // browserslist配置在package.json的browserslist字段里
        require('autoprefixer')({
            remove: false
        })
    ]
};
