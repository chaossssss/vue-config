const path = require('path')
// dll
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
// 分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const isProduction = process.env.NODE_ENV === 'production'
// 代码压缩 项目变大了。
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// gzip 低版本
const CompressionPlugin = require('compression-webpack-plugin')
// 进度条
const WebpackBar = require('webpackbar');
// 多线程
const Happypack = require('happypack');
function resolve(dir) {
  return path.join(__dirname, dir)
}
// cdn
const cdn = {
  css: [],
  js: [
      'https://cdn.bootcss.com/vue/2.6.11/vue.runtime.min.js',
      'https://cdn.bootcss.com/vue-router/3.2.0/vue-router.min.js',
      'https://cdn.bootcss.com/vuex/3.4.0/vuex.min.js',
      'https://cdn.bootcss.com/axios/0.21.1/axios.min.js',
  ]
}
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: true,
  devServer: {
    host: 'localhost',
    port: 8078,
  },
  css: {
    extract: false
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@components', resolve('src/components'))
      .set('@static', resolve('src/static'))
    // 生产环境配置
    if (isProduction) {
      // 生产环境注入cdn
      config.plugin('html')
          .tap(args => {
              args[0].cdn = cdn;
              return args;
          });
    }
  },
  configureWebpack: config => {
    config.externals = { 
      AMap: 'AMap',
      vue: 'Vue',
      vuex: 'Vuex',
      'vue-router': 'VueRouter',
      axios: 'axios'
    }
    config.plugins.push(
      new WebpackBar(),
    )
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
      new webpack.DllReferencePlugin({
				context: process.cwd(),
				manifest: require('./public/vendor/vendor-manifest.json')
			})
    )
    config.plugins.push(
			// 将 dll 注入到 生成的 html 模板中
			new AddAssetHtmlPlugin({
				// dll文件位置
				filepath: path.resolve(__dirname, './public/vendor/*.js'),
				// dll 引用路径
				publicPath: './vendor',
				// dll最终输出的目录
				outputPath: './vendor'
			}),
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
    config.plugins.push(
      new Happypack({
        loaders: ['babel-loader', 'vue-loader', 'url-loader'],
        cache: true,
        threads: 5 // 线程数取决于你电脑性能的好坏，好的电脑建议开更多线程
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
          sourceMap: true,
          parallel: true
        })
      )
    }
  }
}
