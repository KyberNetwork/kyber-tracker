/* jscs:disable */
const path = require('path');
const Dotenv_webpack = require('dotenv-webpack');
// const dotenv = require('dotenv').config('./.env');
// const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = () => {
  const minimize = process.env.NODE_ENV === 'production';
  let plugins;
  if(minimize){
    plugins = [
      new Dotenv_webpack({
        path: './.env', // Path to .env file (this is the default)
      }),
      // new MinifyPlugin({}, {
      //   include: /\.js$/
      // }),
      new SWPrecacheWebpackPlugin({
        cacheId: 'kyber-tracker',
        filename: 'service-worker.js',
        staticFileGlobs: ['public/**/*.{svg}','public/**/**/*.{svg}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/raw\.githubusercontent\.com\//,
            handler: 'cacheFirst'
          }
        ],
        minify: true,
        stripPrefix: 'public/'
      })
    ]
  }
  else {
    plugins = [
      new Dotenv_webpack({
        path: './.env', // Path to .env file (this is the default)
      }),
    ]
  }
  return {
    entry: {
      // 'polyfill': 'babel-polyfill',
      'bundle'     : './resources/assets/js/home/index.js',
    },
    output: {
      filename: '[name].js',
      path: path.resolve('.', 'public/js/')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: {
                loader: 'babel-loader',
                options: {
                  presets: ['es2015', 'vue']
                }
              },
              scss: 'vue-style-loader!css-loader!sass-loader',
              sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
            }
          }
        },
        {
          test: /\.css$/,
          loaders: ['style-loader','css-loader']
        },
        {
          test: /\.png$/,
          loader: "url-loader?limit=100000"
        },
        {
          test: /\.jpg$/,
          loader: "file-loader"
        },
        {
          test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader'
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
        }
      ],
    },
    resolveLoader: {
      alias: {
        'scss-loader': 'sass-loader',
      },
    },
    plugins: plugins,
  }
}
