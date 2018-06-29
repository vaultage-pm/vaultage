const baseConfig = require('./webpack.config.base');
const path = require('path');

module.exports = baseConfig.merge({
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
