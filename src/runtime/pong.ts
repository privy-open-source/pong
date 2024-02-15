/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { env } from 'std-env'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    code   : 200,
    message: 'Pong',
    data   : {
      time         : (new Date()).toISOString(),
      app_name     : env.APP_NAME || '-',
      app_version  : env.APP_VERSION || env.BUILD_VERSION || '-',
      platform_name: env.APP_PLATFORM_NAME || env.PLATFORM_NAME || '-',
      platform_type: env.APP_PLATFORM_TYPE || env.PLATFORM_TYPE || '-',
      config       : config.pong.debug ? config.public : undefined,
    },
  }
})
