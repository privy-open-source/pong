import {
  defineNuxtModule,
  addServerHandler,
  createResolver,
  hasNuxtModule,
  addPlugin,
} from '@nuxt/kit'
import { defuArrayFn } from 'defu'
import type { Options } from 'pino-http'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable route /ping
   * @default true
   */
  ping?: boolean,
  /**
   * Enable logger
   * @default true
   */
  logger?: true,
  /**
   * Censor logger
   */
  loggerRedact?: Options['redact'],
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name     : '@privyid/pong',
    configKey: 'pong',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    ping  : true,
    logger: true,
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Add ping route
    if (options.ping) {
      addServerHandler({
        route  : '/ping',
        handler: resolve('./runtime/pong'),
      })
    }

    if (options.logger) {
      nuxt.options.runtimeConfig.pong = defuArrayFn(nuxt.options.runtimeConfig.pong, options, {
        loggerRedact: [
          'req.headers.cookie',
          'req.headers.authorization',
          'req.headers.application-key',
          'req.headers.merchant-key',
        ],
      })

      addServerHandler({
        middleware: true,
        handler   : resolve('./runtime/logger'),
      })

      if (hasNuxtModule('@privyid/nuapi'))
        addPlugin(resolve('./runtime/nuapi'))
    }
  },
})
