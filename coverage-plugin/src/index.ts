/// <reference types="cypress" />
import CDP from 'chrome-remote-interface'
import path from 'path'
import fs, {mkdirSync} from 'fs'
import v8ToIstanbul from 'v8-to-istanbul'
import libCoverage, {CoverageMap} from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import istanbulReports, {ReportOptions} from 'istanbul-reports'
import {Glob} from 'picomatch'
import PluginEvents = Cypress.PluginEvents
import PluginConfigOptions = Cypress.PluginConfigOptions

const picomatch = require('picomatch')

const {readFile, writeFile} = fs.promises

const debug = require('debug')('cypress-native-coverage')

export function nativeCoveragePlugin(on: PluginEvents, config: PluginConfigOptions, options: Partial<{
  basedir: string
  include: Glob
  exclude: Glob
  port: number
  reports: (keyof ReportOptions)[]
  merge: boolean
  excludePath: (pathname: string) => boolean
}> = {}): void {

  const {
    projectRoot
  } = config

  const {
    basedir = 'build',
    include = '/**/*.js',
    exclude,
    reports = [],
    merge = false,
    excludePath
  } = options

  debug(`basedir: ${basedir}`)

  const OUTDIR = path.resolve(projectRoot, basedir)
  const NYC_OUTPUT = path.resolve(projectRoot, '.nyc_output')
  const NYC_OUTFILE = path.join(NYC_OUTPUT, `out.json`)

  try {
    mkdirSync(NYC_OUTPUT, {recursive: true})
  } catch (e) {
  }

  let port = options.port

  let cdp: CDP.Client | null = null
  let attempts = 0

  let coverageMap: CoverageMap
  let merged: Promise<void>

  async function startCoverage() {
    try {
      cdp = await CDP({port})
      cdp.on('disconnect', () => {
        debug('disconnected from chrome debugging protocol')
        cdp = null
      })
      debug(`connected to chrome debugging protocol on port ${port}`)
    } catch (ignored) {
      if (++attempts < 3) {
        setTimeout(startCoverage, 50)
      } else {
        console.error(`unable to connect to chrome debugging protocol on port ${port}`)
      }
      return
    }

    coverageMap = libCoverage.createCoverageMap()
    if (merge) merged = readFile(NYC_OUTFILE, 'utf8').then(text => {
      const data = JSON.parse(text)
      coverageMap.merge(data)
      debug('merged existing coverage map')
    }).catch(() => {
      console.error('unable to merge', NYC_OUTFILE)
    })

    await cdp.Profiler.enable()
    await cdp.Profiler.startPreciseCoverage({
      detailed: true,
      callCount: true,
      allowTriggeredUpdates: true
    })
    debug('started precise coverage')
  }

  const includes = include && picomatch(include)
  const excludes = exclude && picomatch(exclude)
  const isMatch = include
    ? exclude
      ? (path: string) => includes(path) && !excludes(path) : includes
    : exclude
      ? excludes : () => false

  async function takeCoverage() {
    const coverage = await cdp!.Profiler.takePreciseCoverage()
    debug('taken precise coverage')

    for (const {url, functions} of coverage.result) {
      if (url) try {
        const {pathname} = new URL(url)
        if (isMatch(pathname)) {
          debug('matched', pathname)
          const converter = v8ToIstanbul(
            path.join(OUTDIR, pathname),
            0,
            undefined,
            excludePath || (pathname => {
              const relative = path.relative(projectRoot, pathname).replace(/\\/g, '/')
              return !relative.startsWith(basedir)
            })
          )
          await converter.load()
          converter.applyCoverage(functions)
          coverageMap.merge(converter.toIstanbul())
        }
      } catch (error: any) {
        debug(`failed to collect coverage result for: ${url}`, error.message)
      }
    }
  }

  async function stopCoverage() {
    await cdp!.Profiler.stopPreciseCoverage()
    debug('stopped precise coverage')
  }

  async function writeCoverageMap() {
    await writeFile(NYC_OUTFILE, JSON.stringify(coverageMap.toJSON()))
  }

  async function writeReports() {
    const context = libReport.createContext({
      dir: path.resolve(projectRoot, 'coverage'),
      coverageMap
    })

    for (const reporter of reports) {
      istanbulReports.create(reporter, {
        skipEmpty: false
      }).execute(context)
    }
  }

  on('before:browser:launch', (browser, launchOptions) => {

    if (browser.name === 'chrome' || browser.name === 'edge') {
      let rdpArg = launchOptions.args.find(arg => arg.startsWith('--remote-debugging-port'))
      if (!rdpArg) {
        if (port) {
          rdpArg = `--remote-debugging-port=${port}`
          launchOptions.args.push(rdpArg)
          setTimeout(startCoverage, 50)
        } else {
          console.error(`no port specified, native coverage is not available`)
        }
      } else {
        if (port) {
          console.warn(`port ${port} in options will be ignored`)
        }
        port = parseInt(rdpArg.split('=')[1])
        setTimeout(startCoverage, 50)
      }
    } else if (browser.name === 'electron') {
      // Too bad setting --remote-debugging-port doesn't work with electron, we have to rely on the env property:
      // ELECTRON_EXTRA_LAUNCH_ARGS=--remote-debugging-port=????
      const ELECTRON_DEBUG_PORT = /remote-debugging-port\s*=\s*(\d+)/.exec(process.env.ELECTRON_EXTRA_LAUNCH_ARGS || '')
      port = ELECTRON_DEBUG_PORT ? parseInt(ELECTRON_DEBUG_PORT[1]) : 0
      if (port) {
        setTimeout(startCoverage, 50)
      } else {
        console.error(`no port specified in ELECTRON_EXTRA_LAUNCH_ARGS, native coverage is not available`)
      }
    } else {
      console.error(`native coverage is not available in '${browser.name}'`)
    }

    return launchOptions
  })

  on('after:spec', async (spec: Cypress.Spec) => {
    if (cdp) {
      await merged
      await takeCoverage()
      await stopCoverage()
    }
  })

  on('after:run', (): Promise<any> => Promise.all([
    writeCoverageMap(),
    writeReports()
  ]))

}

export default nativeCoveragePlugin