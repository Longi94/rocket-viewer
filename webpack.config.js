const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /\.wasm|boxcars_wasm\.js|node_modules/,
    })
  ]
};
