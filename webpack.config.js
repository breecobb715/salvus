const path = require('path');

module.exports = {
  watchOptions: {
    ignored: /node_modules/
  },
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    fs: "empty",
    net: 'empty',
    tls: 'empty'
  }
};