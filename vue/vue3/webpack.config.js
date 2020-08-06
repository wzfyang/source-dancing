const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.[hash:4].js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'sourcemap',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ]
}