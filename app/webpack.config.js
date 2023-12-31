const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = 3000;

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.[fullhash].js'
    },
    devtool: 'inline-source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '/src/static/index.html'),
        inject: 'body',
        scriptLoading: 'module'
      }),
      new MiniCssExtractPlugin()
    ],
    resolve: {
        fallback: {
          'fs': false,
          'buffer': false,
          'net': false,
          'path': false,
          'stream': false,
          'crypto': false,
          'assert': false,
          'process': false,
          'child_process': false,
          'util': false,
          'tls': false,
          'dns': false,
          'url': false,
          'os': false,
          'timers': false,
          'zlib': false,
          'http': false,
          'https': false,
          'constants': false,
          'querystring': false,
          'aws-sdk': false,
          'mock-aws-s3': false,
          'async_hooks': false,
          'bluebird': false,
          'cardinal': false,
          'npm': false,
          'nock': false
        },
    },
    module: {
      rules: [
        {
          test: /.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
            test: /\.(css)$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, "css-loader"]
        },
      ]
    },
    devServer: {
        host: '0.0.0.0',
        port: port,
        historyApiFallback: true,
        open: true
    }
}