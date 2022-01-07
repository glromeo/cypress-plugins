# Redux Todos Example

This project template was taken from [redux examples](), and adapted to showcase cypress component testing 
using the esbuild based plugins.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run ci`

Runs the test for CI environment

### `npm run cy:open`

Opens the test runner for e2e tests

### `npm run cy:open-ct`

Opens the test runner for ct (component) tests

### What's included

This example uses [cypress-plugin-tab](https://github.com/Bkucera/cypress-plugin-tab) both to show
that plugins are supproted by the cypress-esbuild-dev-server and to actually help in writing some specs.
Notice that `App.spec.js` and `MainSection.spec.js` show how `style` can be imported to be used in component testing.
This is thanks to [esbuild-sass-plugin]() 

#### plugins/index.js
```javascript
const {sassPlugin} = require("esbuild-sass-plugin");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  if (config.testingType === 'component') {
    require('cypress-esbuild-dev-server').esbuildDevServer(on, config, {
      plugins: [
        sassPlugin({type: 'style'})
      ],
      minify: false,
      sourcemap: true,
      treeShaking: false,
      loader: {".js": "jsx"}
    })
  }
}
```