module.exports = {
  entry: './vaultage.ts',
  output: {
    filename: 'dist/vaultage.js',
    path: __dirname,
    library: 'vaultage'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /crypto/,
        loader: 'ignore-me'
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