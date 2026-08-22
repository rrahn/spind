const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const apiHistoryFallback = require('connect-history-api-fallback');
const config = require('../webpack.config');

config.mode = 'development';

const compiler = webpack(config);

console.log('Webpack output path: ' + config.output.path);
console.log('Webpack context: ' + config.context);
console.log('Webpack entries: ' + config.entry);
console.log('Webpack publicPath: ' + config.output.publicPath);

module.exports.webpackComp = webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
});

module.exports.webpackHot = webpackHotMiddleware(compiler);

module.exports.apiFallback = apiHistoryFallback;
