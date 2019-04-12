const HtmlWebpackPlugin = require('html-webpack-plugin');

var path = require('path');
var webpack = require("webpack");

module.exports = {
    entry: [
        // 'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
        // 'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        './smartclip/index.jsx',
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: { inline: true, hot: true },
    // Note: if you set target: electron-renderer, then you can't view it in the browser anymore as webpack then assumes
    // than commonJS is present because of the electron context, so it doesn't include it which leads to loading errors
    // like "Uncaught ReferenceError: require is not defined"
    target: "electron-renderer",
    module: {
        rules: [
            { test: /\.jsx$/, resolve: { extensions: [".js", ".jsx"] }, use: ['react-hot-loader/webpack', 'babel-loader'], exclude: /node_modules/ },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.(png|svg|jpg|gif)$/, use: ['file-loader'] },
            { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] }
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({ template: './smartclip/views/index.html' })
    ]
};