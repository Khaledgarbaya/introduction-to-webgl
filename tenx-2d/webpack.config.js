'use strict'
var webpack = require('webpack')
var path = require('path')
var plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  )
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  )
}

const loaders = [
  {
    test: /\.js?$/,
    exclude: /(node_modules|bower_components|dist)/,
    loader: 'babel-loader'
  }
]

module.exports = {
  context: path.join(__dirname, 'lib'),
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `tenx2d${process.env.NODE_ENV === 'production' ? '.min' : ''}.js`,
    libraryTarget: 'umd',
    library: 'tenx2d'
  },
  module: {
    loaders
  },
  plugins
}
