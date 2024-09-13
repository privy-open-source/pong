import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@privyid/nhp',
    '@privyid/nuapi',
    '../src/module',
  ],
  devtools  : { enabled: false },
  typescript: {
    includeWorkspace: true,
    tsConfig        : {
      compilerOptions: {
        strict          : true,
        strictNullChecks: true,
      },
    },
  },
  runtimeConfig: { public: { showMe: 'SHOW ME' } },
  pong         : {
    traceReqBody: true,
    traceResBody: true,
  },
})
