require('dotenv').config()
const path = require('path')
var express = require('express')
//var server = require('../src/server').default
var webpack = require('webpack')
var webpackConfig = require('./webpack/webpack.config.dev')
var connectHistory = require('connect-history-api-fallback')
var {createProxyMiddleware } = require('http-proxy-middleware')

var app = express()

var port = process.env.PORT || 8080
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const router = express.Router();
router.get('/id1', (req, res, next) => {
  res.json([{fileName: 'pak0.pak', filesize: 32424}, {fileName: 'pak1.pak'}])
} )
router.get('/halloween', (req, res, next) => {
  res.json([{fileName: 'pak0.pak'}])
} )
app.use('/api/assets', router)

app.use(
  '/coop', createProxyMiddleware({ target: 'https://www.netquake.io', changeOrigin: true })
);
app.use(
  '/api', createProxyMiddleware({ target: 'https://www.netquake.io', changeOrigin: true })
);
app.use('/crx', express.static(path.join(__dirname, '../crx')))
app.use('/hipnotic', express.static(path.join(__dirname, '../hipnotic')))
app.use('/rogue', express.static(path.join(__dirname, '../rogue')))
app.use('/id1', express.static(path.join(__dirname, '../id1')))
app.use('/static', express.static(path.join(__dirname, '../static')))
app.use('/af219f577d73362ddd220ef2e5178d73', express.static(path.join(__dirname, '../af219f577d73362ddd220ef2e5178d73')))
app.use(connectHistory())
compiler.hooks.afterEmit.tap('compilation', compilation => {
  // console.log(compilation)
  hotMiddleware.publish({ action: 'reload' })
})

// // force page reload when html-webpack-plugin template changes
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     console.log(data)
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })


// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
app.use(hotMiddleware)

var uri = 'http://localhost:' + port

var readyPromise = new Promise((resolve, _reject) => {
  console.log('> Starting dev server...')
  devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    resolve('listening')
  })
})

//server(app)

var actualServer = app.listen(port, '0.0.0.0')
module.exports = {
  ready: readyPromise,
  close: () => {
    actualServer.close()
  }
}
