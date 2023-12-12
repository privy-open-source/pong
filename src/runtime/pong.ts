import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { env } from 'std-env'

export default defineEventHandler(() => {
  const config     = useRuntimeConfig()
  const showConfig = config.pong.debug

  return {
    code   : 200,
    message: 'Pong',
    data   : {
      time       : (new Date()).toISOString(),
      app_name   : env.APP_NAME ?? '-',
      app_version: env.APP_VERSION ?? env.BUILD_VERSION ?? '-',
      config     : showConfig ? config.public : undefined,
    },
  }
})
