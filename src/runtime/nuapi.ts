import { defineNuxtPlugin, useRoute } from '#imports'
import { onRequest } from '@privyid/nuapi/core'
import { nanoid } from 'nanoid'

export default defineNuxtPlugin(() => {
  const route = useRoute()

  let browserId: string

  onRequest(async (config) => {
    if (config.headers) {
      /**
       * Add Request ID
       */
      if (!config.headers['X-Request-Id'])
        config.headers['X-Request-Id'] = nanoid()

      /**
       * Add Require timestamp
       */
      if (!config.headers['X-Request-Timestamp'])
        config.headers['X-Request-Timestamp'] = Date.now().toString()

      /**
       * Add Browser's fingerprint
       */
      if (!config.headers['X-Browser-Id'] && process.client) {
        if (!browserId) {
          const { default: FpJS } = await import('@fingerprintjs/fingerprintjs')
          const fp                = await FpJS.load()
          const result            = await fp.get()

          browserId = result.visitorId
        }

        config.headers['X-Browser-Id'] = browserId
      }

      /**
       * Add Testing Mode
       */
      if (route.query.testing === 'true')
        config.headers['X-Testing-Mode'] = true
    }

    return config
  })
})
