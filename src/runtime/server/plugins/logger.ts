import type { NitroAppPlugin } from 'nitropack'
import { useLogger } from '../../../core/logger'
import { fromNodeMiddleware } from 'h3'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <NitroAppPlugin> function (nitroApp) {
  nitroApp.hooks.hook('request', fromNodeMiddleware(useLogger()))
}
