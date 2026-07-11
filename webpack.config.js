var path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var ROOT_DIR = path.resolve(__dirname);
var OUT_DIR = path.resolve(__dirname, 'docs');
var SRC_DIR = path.resolve(__dirname, 'src');

const isProd = process.env.NODE_ENV === 'production';

var config = {
  mode: process.env.NODE_ENV,
  entry: {
    main: [SRC_DIR + '/css/main.scss', SRC_DIR + '/js/main.js'],
    pricing: [SRC_DIR + '/css/pricing.scss', SRC_DIR + '/js/pricing.js'],
  },
  output: {
    path: OUT_DIR,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.scss', '.css'],
    modules: [
      SRC_DIR + '/css',
      SRC_DIR + '/js',
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: ['node_modules']
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['main'],
      templateParameters: { isProd: isProd }
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'pricing.html',
      template: './src/pricing.html',
      chunks: ['pricing'],
      templateParameters: { isProd: isProd }
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'expense-tracking/index.html',
      template: './src/expense-tracking.html',
      chunks: ['main'],
      templateParameters: { isProd: isProd }
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'recurring-bills/index.html',
      template: './src/recurring-bills.html',
      chunks: ['main'],
      templateParameters: { isProd: isProd }
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'home-inventory/index.html',
      template: './src/home-inventory.html',
      chunks: ['main'],
      templateParameters: { isProd: isProd }
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: '404.html',
      template: './src/404.html',
      chunks: ['main'],
      templateParameters: { isProd: isProd }
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: `${SRC_DIR}/images`,
          to: `${OUT_DIR}/images`
        },
        { from: 'robots.txt', context: SRC_DIR, to: OUT_DIR },
        { from: 'sitemap.xml', context: SRC_DIR, to: OUT_DIR }
      ]
    }),
  ]
};

// DEVELOPMENT////////////////////////////////////////////
//

if (config.mode == 'development') {
  config.devServer = {
    static: {
      directory: SRC_DIR,
    },
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    host: 'localhost',
    hot: true,
    client: {
      overlay: true,
      logging: 'info',
    },
    port: 3035,
    watchFiles: {
      options: {
        ignored: '/node_modules/'
      }
    },
  }

  config.output.publicPath = '/';
}

// ///////////////////////////////////////////////////////

module.exports = config;
