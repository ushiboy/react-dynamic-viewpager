const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './example/minimal.tsx',
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  devServer: {
    contentBase: './example',
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true
  },
  watchOptions: {
    ignored: ['**/node_modules/**']
  },
  devtool: 'source-map'
};
