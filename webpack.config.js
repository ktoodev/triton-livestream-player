const path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
     filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    watch: true,
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ],
        },
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader?classPrefix=false'
        },
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
      ],
    },
  };
