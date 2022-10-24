'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    content: PATHS.src + '/content.js',
    styles: PATHS.src + '/styles.css',
    background: PATHS.src + '/background.js',
  },
});

module.exports = config;
