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
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
};