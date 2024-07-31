import { useRuntimeConfig } from '#imports'
import type { NitroAppPlugin } from 'nitropack'
import { useLogger } from '../core/logger'
import { fromNodeMiddleware } from 'h3'

function defineNitroPlugin (def: NitroAppPlugin) {
  return def
}

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()

  if (config.pong.logger)
    nitroApp.hooks.hook('request', fromNodeMiddleware(useLogger()))
})
