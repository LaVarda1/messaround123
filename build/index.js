require('dotenv').config()
const webpack = require('webpack')
const webpackProd = require('./webpack/webpack.config.prod')
const chalk = require('chalk')

webpack(webpackProd, (err, stats) => {
  if (err) {
    console.log("Webpack failed: " + err.message)
    console.log(chalk.red('App build finished with errors'))
    return
  //throw err
  }

  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  console.log(chalk.cyan('App build complete!'))
})
