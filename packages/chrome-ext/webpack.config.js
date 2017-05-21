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
      }
    ]
  },
  externals: {
    fs: true,
    crypto: true,
    angular: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
    "alias": {
      "request": "xhr"
    }
  },
};