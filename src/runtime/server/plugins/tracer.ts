import tracer from 'dd-trace'
import { useRuntimeConfig } from '#imports'
import type { NitroAppPlugin } from 'nitropack'
import { fromNodeMiddleware } from 'h3'
import bodyParser from 'body-parser'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <NitroAppPlugin> function (nitroApp) {
  const config = useRuntimeConfig()

  if (config.pong.traceReqBody)
    nitroApp.hooks.hook('request', fromNodeMiddleware(bodyParser.json(config.pong.bodyParser)))

  nitroApp.hooks.hook('error', (error) => {
    tracer.scope().active()?.setTag('error', error)
  })
}
