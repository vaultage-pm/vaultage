const path = require('path');
const webpack = require('webpack');

const REPO_ROOT = __dirname;

module.exports = {
    mode: 'development',

    entry: {
        'background': [ './src/background.ts' ],
        'controller': [ './src/controller.ts' ],
        'content': [ './src/content.ts' ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(REPO_ROOT, 'dist'),
        publicPath: '/dist'
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
                    loader: 'ts-loader'
                },
            ]
        }]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        })
    ],
};