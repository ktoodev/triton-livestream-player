const path = require('path');

  module.exports = {
    devtool : 'source-map',

    entry: [
      './src/index.js'
    ],
    output: {
     filename: 'player.js',
      path: path.resolve(__dirname, 'dist'),
    },
    watch: true,
    module: {
      rules: [
        {
           test: /\.js$/,
           //exclude: /node_modules\/(?!copy-text-to-clipboard)/,
           use: {
      				loader: 'babel-loader',
      				options: {
      					presets: ['@babel/preset-env']
      				}
      			}
         },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ],
        },
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
