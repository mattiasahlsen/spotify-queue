const path = require('path')

const serverConfig = require('./src/server/config')

module.exports = {
  publicPath: serverConfig.origin,
  devServer: {
    historyApiFallback: true,
  },

  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('scss').oneOf(type)))
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/styles/imports.scss'),
        path.resolve(__dirname, './src/styles/main.scss'),
      ],
    })
}