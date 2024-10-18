/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { env } from 'std-env'
import si from 'systeminformation'
import { memoryUsage } from 'node:process'
import { formatAllBytes } from '../../../core/utils'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  return {
    code   : 200,
    message: 'Pong',
    data   : {
      time         : (new Date()).toISOString(),
      app_name     : env.APP_NAME || '-',
      app_version  : env.BUILD_VERSION || env.APP_VERSION || '-',
      platform_name: env.APP_PLATFORM_NAME || env.PLATFORM_NAME || '-',
      platform_type: env.APP_PLATFORM_TYPE || env.PLATFORM_TYPE || '-',
      dd_env       : env.DD_ENV || '-',
      dd_service   : env.DD_SERVICE || '-',
      dd_version   : env.DD_VERSION || '-',
      config       : config.pong.debug ? config.public : undefined,
      sysinfo      : config.pong.sysinfo
        ? {
            memory: formatAllBytes({
              process: memoryUsage(),
              os     : await si.mem(),
            }),
          }
        : undefined,
    },
  }
})
