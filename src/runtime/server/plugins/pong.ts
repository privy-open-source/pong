import { useRuntimeConfig } from '#imports'
import type { NitroAppPlugin } from 'nitropack'
import { useLogger } from '../../../core/logger'
import { fromNodeMiddleware } from 'h3'
import bodyParser from 'body-parser'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <NitroAppPlugin> function (nitroApp) {
  const config = useRuntimeConfig()

  if (config.pong.tracer && config.pong.traceReqBody)
    nitroApp.hooks.hook('request', fromNodeMiddleware(bodyParser.json(config.pong.bodyParser)))

  if (config.pong.logger)
    nitroApp.hooks.hook('request', fromNodeMiddleware(useLogger()))
}