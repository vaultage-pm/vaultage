module.exports = {
  entry: {
    app: './src/main.ts',
    background: './src/background.ts'
  },
  output: {
    filename: 'dist/vaultage-[name].js',
    path: __dirname
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