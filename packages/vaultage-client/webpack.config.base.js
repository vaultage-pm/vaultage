const path = require('path');
const _ = require('lodash');


const env = process.env.NODE_ENV || 'development';

const defaults = {
  mode: env,
  entry: './src/vaultage.ts',
  output: {
    library: 'vaultage',
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      "request": "xhr"
    }
  },
};

module.exports.defaults = defaults;

module.exports.merge = function merge(config) {
  return _.merge({}, defaults, config);
};