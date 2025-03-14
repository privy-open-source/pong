<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Pong
- Package name: @privyid/pong
- Description: Service discovery and Logging module
-->

# Pong

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Service discovery, Log & Trace module

- [✨ &nbsp;Release Notes](https://github.com/privy-open-source/pong/releases)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@privyid/pong?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## What this module do?

<!-- Highlight some of the features your module provide here -->
- Add `/ping` route
- Add Request Logger
- Add Datadog Tracer
- Inject special header to [NuAPI](https://github.com/privy-open-source/nuapi) client

## Quick Setup

1. Add `@privyid/pong` dependency to your project

```bash
yarn add --dev @privyid/pong
```

2. Add `@privyid/pong` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@privyid/pong'
  ]
})
```

That's it! You can now use Pong in your Nuxt app ✨

## Datadog

If you using datadog, don't forget to set these ENV to make sure tracer work properly:

```sh
DD_ENV= # App enviroment, ex: development-cartenzs or  production-cartensz
DD_SERVICE= # Your service name, ex: cartensz-web-app
DD_VERSION= # (Optional) Your service version, ex: 1.0.0
```

## NHP Trace Proxy Body

By default, Pong not trace any requests / responses's body because it might be interupting data flow in proxy. But if you can enable it by following this steps:

1. Enable in your `nuxt.config.ts`
```ts
export default defineNuxtConfig({
  // ...
  pong: {
    // ...
    traceReqBody      : true,
    traceResBody      : true,
    logLevelThreshold : 'info',
    // ...
  },
})
```

2. Replace import from `@privyid/nhp/core` to `@privyid/pong/nhp` in your `server.config.ts`

```diff
-import { defineServer } from '@privyid/nhp/core'
+import { defineServer } from '@privyid/pong/nhp'

export default defineServer([
  {
    name     : 'example',
    baseUrl  : '/api/example',
    targetUrl: 'https://reqres.in/api/',
  },
])
```

## Contribution

- Clone this repository
- Play [Nyan Cat](https://www.youtube.com/watch?v=QH2-TGUlwu4) in the background (really important!)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Run `yarn install`
- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start [playground](./playground) in development mode.

## License

[MIT License](/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@privyid/pong/latest.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@privyid/pong

[npm-downloads-src]: https://img.shields.io/npm/dm/@privyid/pong.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@privyid/pong

[license-src]: https://img.shields.io/npm/l/@privyid/pong.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@privyid/pong

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js&style=for-the-badge&colorA=18181B&colorB=28CF8D
[nuxt-href]: https://nuxt.com
