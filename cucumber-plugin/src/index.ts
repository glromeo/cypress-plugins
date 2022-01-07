/// <reference types="cypress" />
import {build, BuildOptions, OnLoadArgs, OnResolveArgs, PluginBuild} from 'esbuild'
import Cypress from 'cypress'
import path from 'path'
import fs from 'fs'
import chokidar from 'chokidar'
import PluginEvents = Cypress.PluginEvents
import FileObject = Cypress.FileObject
import PluginConfigOptions = Cypress.PluginConfigOptions

const compile = require('cypress-cucumber-preprocessor/lib/loader.js')
const compileFeatures = require('cypress-cucumber-preprocessor/lib/featuresLoader.js')
const stepDefinitionPath = require('cypress-cucumber-preprocessor/lib/stepDefinitionPath.js')

const debug = require('debug')('cypress-cucumber-plugin')

let watcher: chokidar.FSWatcher

export function cucumberPlugin(on: PluginEvents, config: PluginConfigOptions, options: BuildOptions): void {

  const cache = new Map<string, { file: FileObject; outPath: string | undefined }>()

  if (watcher) {
    watcher.close()
  }
  watcher = chokidar.watch([], {
    ignoreInitial: true,
    disableGlobbing: true,
    atomic: false
  })
  watcher.on('change', (filename: string) => {
    console.log('detected change for:', filename)
    if (cache.has(filename)) {
      const entry = cache.get(filename)!
      entry.outPath = undefined
      entry.file.emit('rerun')
    }

  })

  const esbuildOptions: BuildOptions = {
    ...options,
    define: {
      '__dirname': '"/"'
    },
    inject: [
      path.resolve(__dirname, './process-shim.js')
    ],
    plugins: [{
      name: 'cucumber',
      setup(build: PluginBuild) {
        build.onResolve({filter: /^path$/}, () => {
          return {
            path: require.resolve('path-browserify')
          }
        })
        build.onResolve({filter: /\.features?$/}, (args: OnResolveArgs) => {
          return {
            path: args.path
          }
        })
        build.onLoad({filter: /\.feature$/}, (args: OnLoadArgs) => {
          return {
            contents: compile(fs.readFileSync(args.path), args.path)
          }
        })
        build.onLoad({filter: /\.features$/}, (args: OnLoadArgs) => {
          return ({
            contents: compileFeatures(fs.readFileSync(args.path), args.path)
          })
        })
        build.onResolve({filter: /^cypress-cucumber-preprocessor/}, args => {
          return {path: require.resolve(args.path)}
        })
      }
    }]
  }

  async function buildFile(filePath: string, outputPath: string): Promise<string> {
    await build({
      ...esbuildOptions,
      entryPoints: [filePath],
      outfile: outputPath,
      bundle: true,
      format: 'iife',
      minify: false
    })
    return outputPath
  }

  on('file:preprocessor', async function (file: Cypress.FileObject): Promise<string> {
    const {filePath, outputPath, shouldWatch} = file
    let entry = cache.get(filePath)
    if (!entry) {
      if (shouldWatch) {
        watcher.add(filePath)
        file.on('close', () => {
          watcher.unwatch(filePath)
          cache.delete(filePath)
        })
      }
      entry = {
        file: file,
        outPath: undefined
      }
    }
    if (!entry.outPath) {
      await buildFile(filePath, outputPath)
      entry.outPath = outputPath
    }
    return entry.outPath
  })

}

export default cucumberPlugin