import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    code   : 200,
    message: 'Pong',
    data   : {
      time       : (new Date()).toISOString(),
      app_name   : import.meta.env.APP_NAME ?? '-',
      app_version: import.meta.env.APP_VERSION ?? import.meta.env.BUILD_VERSION ?? '-',
      config     : config.public,
    },
  }
})
