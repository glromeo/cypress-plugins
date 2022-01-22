/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const {nativeCoveragePlugin} = require('cypress-native-coverage')
const {sassPlugin} = require('esbuild-sass-plugin')
const fs = require('fs')
const {posix} = require('path')

try {
  fs.rmSync('cypress/outdir', {force: true, recursive: true})
  fs.mkdirSync('cypress/outdir', {recursive: true})
} catch ({message}) {
  console.warn('error clearing outdir:', message)
}

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  if (config.testingType === 'component') {

    nativeCoveragePlugin(on, config, {
      basedir: 'cypress/outdir',
      prefix: '/__cypress/src',
      include: `/${config.component.componentFolder}/${config.component.testFiles}`,
      reports: ['html']
    })

    require('cypress-esbuild-dev-server').esbuildDevServer(on, config, {
      outdir: 'cypress/outdir',
      plugins: [
        sassPlugin({type: 'style'})
      ],
      minify: false,
      treeShaking: false,
      loader: {'.js': 'jsx'}
    })
  }
}
