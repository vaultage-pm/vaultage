module.exports = {
  entry: './src/vaultage.ts',
  output: {
    filename: 'dist/vaultage.js',
    path: __dirname,
    library: 'vaultage',
    libraryTarget: 'umd'
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
    "alias": {
      "request": "xhr"
    }
  },
};