const path = require('path');
const _ = require('lodash');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

const defaults = {
    mode: env,
    entry: './src/public-api.ts',
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
                options: {
                    configFile: 'tsconfig.lib.json'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [new TsconfigPathsPlugin({
            extensions: ['.ts', '.js']
        })],
        alias: {
            "request": "xhr"
        }
    },
    externals: {
        crypto: 'crypto'
    },
    optimization: {
        usedExports: true
    }
};

const nodeConfig = _.merge({}, defaults, {
    mode: "production",
    output: {
        filename: 'vaultage.js',
        chunkFilename: '[name].bundle.js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'node',
    plugins: [
        // Uncomment to analyze bundle
        // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    ]
});

const sjclConfig = _.merge({}, defaults, {
    mode: "production",
    output: {
        filename: 'vaultage-sjcl.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            './Crypto.node': path.resolve(__dirname, 'src/crypto/Crypto.sjcl')
        }
    },
    plugins: [
        // Uncomment to analyze bundle
        // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    ]
});

module.exports = [ nodeConfig, sjclConfig ];
