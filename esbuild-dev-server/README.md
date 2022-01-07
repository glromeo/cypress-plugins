# Cypress esbuild dev server

This plugin uses esbuild to bundle component tests and serves them with express

## Install
```
> npm i --save-dev cypress-esbuild-dev-server
```

## Usage
In your `cypress/plugins/index.js` add:
```javascript
module.exports = (on, config) => {

    ...
    
    require('cypress-esbuild-dev-server').esbuildDevServer(on, config, {
        ... // your esbuild options
    })
}
```
**NOTE**: Ideally the main esbuild options (plugins, etc) should be the same that are used for the dev/prod build

The plugin will override some of the options
- `entryPoints` will be the spec and the support source files that's being built
- `bundle` will be forced to `true`
- `write` will be forced to `false` preventing anything to be written to `outdir` or `outfile`

## Hot Module Reload
This initial version doesn't support HMR. 

*sorry folks... you have to consume your `reload` button! :smile:*