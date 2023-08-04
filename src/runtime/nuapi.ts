import { defineNuxtPlugin, useRoute } from '#imports'
import { onRequest } from '@privyid/nuapi/core'
import { nanoid } from 'nanoid'

export default defineNuxtPlugin(() => {
  const route = useRoute()

  onRequest(async (config) => {
    if (config.headers) {
      /**
       * Add RequestId
       */
      if (!config.headers['X-Request-Id'])
        config.headers['X-Request-Id'] = nanoid()

      /**
       * Add Browser's finggerprint
       */
      if (!config.headers['X-Browser-Id'] && process.client) {
        const { default: FpJS } = await import('@fingerprintjs/fingerprintjs')
        const fp                = await FpJS.load()
        const result            = await fp.get()

        config.headers['X-Browser-Id'] = result.visitorId
      }

      /**
       * Add Browser's current url
       */
      if (!config.headers['X-Browser-Path'])
        config.headers['X-Browser-Path'] = route.fullPath

      /**
       * Add Testing Mode
       */
      if (route.query.testing === 'true')
        config.headers['X-Testing-Mode'] = true
    }

    return config
  })
})
