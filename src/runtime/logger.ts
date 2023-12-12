import tracer from '../core/tracer'
import { useRuntimeConfig } from '#imports'
import type { NitroAppPlugin } from 'nitropack'
import { useLogger } from '../core/logger'
import { fromNodeMiddleware } from 'h3'

function defineNitroPlugin (def: NitroAppPlugin) {
  return def
}

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const logger = config.pong.tracer
    ? tracer.wrap('nuxt.request', useLogger())
    : useLogger()

  if (config.pong.logger) {
    nitroApp.h3App.stack.unshift({
      route  : '',
      handler: fromNodeMiddleware(logger),
    })
  }
})
