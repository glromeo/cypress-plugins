/// <reference types="cypress" />
import express from 'express'
import {join, relative, resolve} from 'path'
import * as esbuild from 'esbuild'

const indexHtml = (__cypress_spec_path:string) => `
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
  esbuildOptions?: esbuild.BuildOptions
): void {
  if (config.testingType !== 'component') {
    return
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
      if (!/\.[jt]sx?$/.test(req.url)) {
        return next()
      }
      try {
        const result = await esbuild.build({
          ...esbuildOptions,
          entryPoints: [join(projectRoot, req.url)],
          write: false,
          bundle: true,
          sourcemap: true
        })
        const outputFile = result.outputFiles[0]
        const contents = outputFile.contents
        res.set('Content-Type', 'application/javascript; charset=utf-8')
        res.end(contents, 'utf-8')
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