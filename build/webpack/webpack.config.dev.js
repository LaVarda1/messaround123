const base = require('./webpack.config')
const merge = require('webpack-merge')
const webpack = require('webpack')

module.exports = merge({
  devtool: 'eval-source-map',
  entry: {
    app: ['webpack-hot-middleware/client', "./src/app/web/index.js"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
}, base)