const base = require('./webpack.config')
const merge = require('webpack-merge')
const webpack = require('webpack')

module.exports = merge(base, {
  entry: {
    app: ['webpack-hot-middleware/client', "./src/app/web/index.js"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
})