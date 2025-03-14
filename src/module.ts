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
import type { OptionsJson } from 'body-parser'
import type { Plugin } from 'rollup'
import injectDDTrace from './rollup'

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
   * Tracer blocklist url
   */
  tracerBlocklist?: string[],
  /**
   * Trace request body
   *
   * ⚠️ This request additional config
   * @experimental
   * @link https://github.com/privy-open-source/pong#nhp-trace-proxy-body
   * @default false
   */
  traceReqBody?: boolean,
  /**
   * Trace response body (NHP).
   *
   * ⚠️ This request additional config
   * @experimental
   * @link https://github.com/privy-open-source/pong#nhp-trace-proxy-body
   * @default false
   */
  traceResBody?: boolean,
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
  /**
   * Enable system monitor:
   * - Show memusage in `/ping`'s response
   * @default true
   */
  sysinfo?: boolean,
  /**
   * Body Parser JSON options
   */
  bodyParser?: OptionsJson,
  /**
   * Minimum log level sent to the logger
   */
  logLevelThreshold?: 'error' | 'warn' | 'info',
}

export interface ModuleRuntimeConfig {
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
    ping             : true,
    logger           : true,
    tracer           : true,
    tracerBlocklist  : [],
    traceReqBody     : false,
    traceResBody     : false,
    nuapi            : true,
    debug            : true,
    sysinfo          : true,
    bodyParser       : {},
    logLevelThreshold: 'info',
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.pong = defuArrayFn(nuxt.options.runtimeConfig.pong, options, {
      loggerRedact: [
        'req.headers.cookie',
        'req.headers.authorization',
        'req.headers["x-token"]',
        'req.headers["x-signature"]',
        'req.headers["x-signature-payload"]',
        'req.headers["application-key"]',
        'req.headers["merchant-key"]',
      ],
    })

    // Add ping route
    if (options.ping) {
      addServerHandler({
        route  : '/ping',
        handler: resolve('./runtime/server/route/pong'),
      })
    }

    // Add Datadog Tracer
    if (options.tracer) {
      nuxt.hook('nitro:init', (nitro) => {
        nitro.hooks.hook('rollup:before', (_, config) => {
          (config.plugins as Plugin[]).push(injectDDTrace([resolve('./core/tracer')]))
        })
      })

      addServerPlugin(resolve('./runtime/server/plugins/tracer'))
    }

    // Add Pino Logger
    if (options.logger)
      addServerPlugin(resolve('./runtime/server/plugins/logger'))

    // Inject NuApi
    if (options.nuapi && hasNuxtModule('@privyid/nuapi'))
      addPlugin(resolve('./runtime/plugins/nuapi'))
  },
})
