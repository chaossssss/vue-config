const path = require('path')
// const webpack = require('webpack')
// const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
// 分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const isProduction = process.env.NODE_ENV === 'production' ? true : false
// 代码压缩 项目变大了。
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// gzip 低版本
const CompressionPlugin = require('compression-webpack-plugin')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  // productionSourceMap: false,
  devServer: {
    host: 'localhost',
    port: 8078,
    // before(app, server) {
    //   app.get(/.*.(js)$/, (req, res, next) => {
    //     req.url = req.url + '.gz'
    //     res.set('Content-Encoding', 'gzip')
    //     next()
    //   })
    // }
  },
  css: {
    extract: false
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@components', resolve('src/components'))
      .set('@static', resolve('src/static'))
  },
  configureWebpack: config => {
    config.externals = { AMap: 'AMap' }
    config.plugins.push(          
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      })
    )
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 8689,
        reportFilename: 'report.html',
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: null,
        logLevel: 'info'
      })
    )

    // 生产环境相关配置
    if (isProduction) {
      // 代码压缩
      config.plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            //生产环境自动删除console
            compress: {
              // warnings: false, // 若打包错误，则注释这行
              drop_debugger: true,
              drop_console: true,
              pure_funcs: ['console.log']
            }
          },
          sourceMap: false,
          parallel: true
        })
      )
    }
  }
}
