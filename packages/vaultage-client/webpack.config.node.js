const baseConfig = require("./webpack.config.base");

module.exports = baseConfig.merge({
    output: {
        filename: 'dist/vaultage.js',
        chunkFilename: 'dist/[name].bundle.js',
        libraryTarget: 'commonjs'
    },
});
