/// <reference types="cypress" />
import express from 'express'
import {join, relative, resolve} from 'path'
import * as esbuild from 'esbuild'
import {createReadStream} from 'fs'

const indexHtml = (__cypress_spec_path: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="width=device-width,initial-scale=1.0" name="viewport">
    <title>Cypress Component Tests App</title>
    <script type="text/javascript">
        const Cypress = window["Cypress"] = parent.Cypress

        const importsToLoad = [
            () => import("/__cypress/src/cypress/support/index.js"),
            () => import("/__cypress/src/${__cypress_spec_path}"),
        ]

        Cypress.onSpecWindow(window, importsToLoad)
        Cypress.action('app:window:before:load', window)

        const appendTargetIfNotExists = (id, tag = 'div', parent = document.body) => {
            let node = document.getElementById(id)
            if (!node) {
                node = document.createElement(tag)
                node.setAttribute('id', id)
                parent.appendChild(node)
            }
            node.innerHTML = ''
            return node
        };

        beforeEach(() => {
            appendTargetIfNotExists('__cy_root').appendChild(appendTargetIfNotExists('__cy_app'))
        })
    </script>
</head>
<body>
<div id="app"></div>
</body>
</html>
`

export function esbuildDevServer(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  esbuildOptions: esbuild.BuildOptions = {}
): void {
  if (config.testingType !== 'component') {
    return
  }

  if (!esbuildOptions.outdir) {
    console.error("you must specify 'outdir' where the files served by the dev-server are stored temporarily")
    process.exit(-1)
  }

  on('dev-server:start', async (options: Cypress.DevServerConfig): Promise<Cypress.ResolvedDevServerConfig> => {
    const app = express()
    const port = 4000

    const {devServerEvents, specs, config: {devServerPublicPathRoute, projectRoot}} = options
    app.use(`${devServerPublicPathRoute}/index.html`, async function (req, res) {
      const __cypress_spec_path = relative(projectRoot, req.header('__cypress_spec_path')!).replace(/\\/g, '/')
      res.end(indexHtml(__cypress_spec_path))
    })

    app.use(`${devServerPublicPathRoute}`, async function (req, res, next) {
      const pathname = req.url.slice(1)
      if (!/\.[jt]sx?$/.test(pathname)) {
        return next()
      }
      try {
        await esbuild.build({
          ...esbuildOptions,
          absWorkingDir: projectRoot,
          outbase: projectRoot,
          entryPoints: [pathname],
          bundle: true,
          sourcemap: true
        })
        res.set('Content-Type', 'application/javascript; charset=utf-8')
        const outfile = join(resolve(projectRoot, esbuildOptions.outdir!), pathname)
        createReadStream(outfile).pipe(res)
      } catch (e: any) {
        res.set('Content-Type', 'text/plain; charset=utf-8')
        res.status(500).send(e.message)
      }
    })

    app.use(devServerPublicPathRoute, express.static(projectRoot))

    app.use(express.static(join(projectRoot, 'node_modules')))

    const server = app.listen(port, () => {
      console.log('dev server started')
    })

    return {
      port,
      close() {
        server.close(() => {
          console.log('dev server closed')
        })
      }
    }
  })
}

export default esbuildDevServer