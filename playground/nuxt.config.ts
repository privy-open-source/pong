import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules   : ['../src/module'],
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
})
