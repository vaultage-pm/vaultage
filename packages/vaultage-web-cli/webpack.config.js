const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const REPO_ROOT = __dirname;

module.exports = {
    entry: {
        'main': [
            './src/main.ts'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(REPO_ROOT, 'public/dist'),
        publicPath: '/dist'
    },

    devServer: {
        compress: true,
        port: 9000,
        hot: true,
        contentBase: 'public',
        allowedHosts: ['localhost']
    },

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.less'],
        modules: ['node_modules', 'src', '..']
    },

    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',

    externals: {
        'vaultage-client': 'vaultage'
    },

    // Add the loader for .ts files.
    module: {
        rules: [{
            include: path.join(REPO_ROOT, '.'),
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    },
                },
            ]
        }]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin({
            // Compute HMR chunks first
            multiStep: true
        }),
        new webpack.NamedModulesPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        })
    ],
};