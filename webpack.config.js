const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'
const mode = isDev ? 'development' : 'production'

module.exports = {
  mode,
  entry: {
    app: './src/main.ts'
  },
  devtool: isDev
    ? 'inline-source-map'
    : false,
  output: {
    filename: 'assets/js/[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './static/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/styles.[hash].css'
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    contentBase: false,
    hot: true,
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/i,
        use: [
          isDev
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '~': path.resolve(__dirname, 'src/')
    }
  }
}