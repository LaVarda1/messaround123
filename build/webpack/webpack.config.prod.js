const base = require('./webpack.config')
const merge = require('webpack-merge')
const path = require("path");

const resolveDir = dir => '../../' + dir

module.exports = merge(base, {
  devtool: 'none',
  entry: {
    app: [ "./src/app/web/index.js"]
  },
  output: {
    path: path.join(__dirname, resolveDir("dist/app")),
    filename: "[name].[hash].bundle.js",
    chunkFilename: "[id].[hash].chunk.js",
    publicPath: '/'
  },
  plugins: [
  ]
})