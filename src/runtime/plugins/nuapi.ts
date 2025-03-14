/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
  defineNuxtPlugin,
  useRoute,
  useState,
  ref,
  watch,
  type Ref,
  useCookie,
} from '#imports'
import { onRequest } from '@privyid/nuapi/core'
import { v4 as uuidv4 } from 'uuid'
import { env } from 'std-env'
import { isUUID } from '../../core/utils'

/**
 * Waiting loading ref to false
 * @param loading
 */
async function waitLoading (loading: Ref<boolean>) {
  await new Promise<void>((resolve) => {
    const stop = watch(loading, (value) => {
      if (!value) {
        stop()
        resolve()
      }
    }, { immediate: true })
  })
}

export default defineNuxtPlugin({
  name     : 'pong:nuapi-plugin',
  dependsOn: ['nuapi:plugin'],
  enforce  : 'post',
  setup () {
    const isLoading = ref(false)
    const browserId = useCookie('_browser/fingerprint')
    const route     = useRoute()

    const appName      = useState('appName', () => env.APP_NAME)
    const appVersion   = useState('appVersion', () => env.BUILD_VERSION || env.APP_VERSION)
    const platformName = useState('platformName', () => env.APP_PLATFORM_NAME || env.PLATFORM_NAME)
    const platformType = useState('platformType', () => env.APP_PLATFORM_TYPE || env.PLATFORM_TYPE)

    onRequest(async (config) => {
      if (config.headers) {
        /**
         * Add Browser's fingerprint
         */
        if (!config.headers['X-Browser-Id']) {
          // Prevent double request
          if (isLoading.value)
            await waitLoading(isLoading)

          if (!browserId.value && import.meta.client) {
            try {
              isLoading.value = true

              const { default: FpJS } = await import('@fingerprintjs/fingerprintjs')
              const fp                = await FpJS.load()
              const result            = await fp.get()

              browserId.value = result.visitorId
            } finally {
              isLoading.value = false
            }
          }

          if (browserId.value)
            config.headers['X-Browser-Id'] = browserId.value
        }

        /**
         * Add Browser's screen size
         */
        if (!config.headers['X-Browser-Screen'] && import.meta.client)
          config.headers['X-Browser-Screen'] = `${window.screen.width}x${window.screen.height}`

        /**
         * Add Application name
         */
        if (!config.headers['X-Application-Name'] && appName.value)
          config.headers['X-Application-Name'] = appName.value

        /**
         * Add Application version
         */
        if (!config.headers['X-Application-Version'] && appVersion.value)
          config.headers['X-Application-Version'] = appVersion.value

        /**
         * Add Platform name
         */
        if (!config.headers['X-Platform-Name'] && platformName.value)
          config.headers['X-Platform-Name'] = platformName.value

        /**
         * Add Platform type
         */
        if (!config.headers['X-Platform-Type'] && platformType.value)
          config.headers['X-Platform-Type'] = platformType.value

        /**
         * Add Testing mode
         */
        if (route.query.testing === 'true')
          config.headers['X-Testing-Mode'] = true

        /**
         * Add Request ID
         */
        if (!config.headers['X-Request-Id'] || !isUUID(config.headers['X-Request-Id']))
          config.headers['X-Request-Id'] = uuidv4()

        /**
         * Add Request timestamp
         */
        if (!config.headers['X-Request-Timestamp'])
          config.headers['X-Request-Timestamp'] = Date.now().toString()
      }

      return config
    })
  },
})
