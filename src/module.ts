import {
  defineNuxtModule,
  addServerHandler,
  createResolver,
  hasNuxtModule,
  addPlugin,
  addServerPlugin,
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
  logger?: boolean,
  /**
   * Censor logger
   */
  loggerRedact?: Options['redact'],
  /**
   * Enable Datadog Tracer
   * @default true
   */
  tracer?: boolean,
  /**
   * Inject special headers to NuAPI
   * @default true
   */
  nuapi?: boolean,
  /**
   * Enable debug mode:
   * - Show public config in `/ping`'s response
   * @default true
   */
  debug?: boolean,
}

export interface ModulePrivateRuntimeConfig {
  pong: Required<ModuleOptions>,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name         : '@privyid/pong',
    configKey    : 'pong',
    compatibility: { nuxt: '>=3.4.0' },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    ping  : true,
    logger: true,
    tracer: true,
    nuapi : true,
    debug : true,
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
          'request.headers.cookie',
          'request.headers.authorization',
          'request.headers["x-token"]',
          'request.headers["x-signature"]',
          'request.headers["x-signature-payload"]',
          'request.headers["application-key"]',
          'request.headers["merchant-key"]',
          'user.uuid',
        ],
      })

      addServerPlugin(resolve('./runtime/logger'))
    }

    if (options.nuapi && hasNuxtModule('@privyid/nuapi'))
      addPlugin(resolve('./runtime/nuapi'))
  },
})
