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

const nodeConfig = _.merge({}, defaults, {
    output: {
        filename: 'dist/vaultage.js',
        chunkFilename: 'dist/[name].bundle.js',
        libraryTarget: 'commonjs2'
    },
    target: 'node'
});

const sjclConfig = _.merge({}, defaults, {
    output: {
      filename: 'dist/vaultage-sjcl.js',
      libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            './Crypto.node': path.resolve(__dirname, 'src/crypto/Crypto.sjcl')
        }
    }
});

module.exports = [ nodeConfig, sjclConfig ];
