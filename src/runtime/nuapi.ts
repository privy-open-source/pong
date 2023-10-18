import {
  defineNuxtPlugin,
  useRoute,
  useState,
} from '#imports'
import { onRequest } from '@privyid/nuapi/core'
import { nanoid } from 'nanoid'
import { env } from 'std-env'

export default defineNuxtPlugin(() => {
  const route       = useRoute()
  const appName     = useState(() => env.APP_NAME)
  const appVersion  = useState(() => (env.APP_VERSION ?? env.BUILD_VERSION))
  const appPlatform = useState(() => env.APP_PLATFORM)

  let browserId: string

  onRequest(async (config) => {
    if (config.headers) {
      /**
       * Add Request ID
       */
      if (!config.headers['X-Request-Id'])
        config.headers['X-Request-Id'] = nanoid()

      /**
       * Add Request timestamp
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
       * Add Application name
       */
      if (!config.headers['X-Application-Name'])
        config.headers['X-Application-Name'] = appName.value ?? '-'

      /**
       * Add Application version
       */
      if (!config.headers['X-Application-Version'])
        config.headers['X-Application-Version'] = appVersion.value ?? '-'

      /**
       * Add Platform name
       */
      if (!config.headers['X-Platform-Name'])
        config.headers['X-Platform-Name'] = appPlatform.value ?? 'web'

      /**
       * Add Testing mode
       */
      if (route.query.testing === 'true')
        config.headers['X-Testing-Mode'] = true
    }

    return config
  })
})
