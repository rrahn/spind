const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dev = true;

const hmrPlugins = dev ? ['webpack-hot-middleware/client'] : [];

console.log(__dirname);
console.log(path.join(__dirname, 'client', 'public', 'index.html'));

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname),
    entry: [...hmrPlugins, './client/App.tsx'],
    devtool: dev ? 'inline-source-map' : undefined,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.[fullhash].js',
        clean: true,
        pathinfo: true,
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join('client', 'public', 'index.html'), // path.join(__dirname, 'client', 'public', 'index.html'),
            filename: 'index.html',
            inject: 'body',
            scriptLoading: 'module',
        }),
        // new webpack.ProvidePlugin({
        //     React: 'react',
        // }),
        new MiniCssExtractPlugin(),
    ],
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.(css)$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/i,
                exclude: /node_modules/,
                use: ['file-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        hot: true,
        historyApiFallBack: true,
    },
};
