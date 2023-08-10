import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    code   : 200,
    message: 'Pong',
    data   : {
      time       : (new Date()).toISOString(),
      app_name   : process.env.APP_NAME ?? '-',
      app_version: process.env.APP_VERSION ?? process.env.BUILD_VERSION ?? '-',
      config     : config.public,
    },
  }
})
