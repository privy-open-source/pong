import ddTrace, { type Span } from 'dd-trace'
import {
  ClientRequest,
  IncomingMessage,
  type ServerResponse,
} from 'node:http'
import {
  parseJWT,
  parseScreen,
  replaceId,
} from './utils'
import {
  parsePath,
  parseURL,
  withBase,
  cleanDoubleSlashes,
} from 'ufo'
import { parseUA } from 'browserslist-ua-parser'
import { useRuntimeConfig } from '#imports'

declare module 'http' {
  export interface IncomingMessage {
    originalUrl?: string,
    body?: any,
  }

  export interface ServerResponse {
    body?: any,
  }
}

const TRACE_HEADERS: string[] = [
  'content-type',
  'content-length',
  'referer',
  'user-agent',
  'x-request-id',
  'x-request-timestamp',
  'x-browser-id',
  'x-browser-screen',
  'x-api-version',
  'x-application-name',
  'x-application-version',
  'x-platform-name',
  'x-platform-type',
  'x-testing-mode',
]

function traceRequest (span?: Span, req?: IncomingMessage | ClientRequest, res?: IncomingMessage | ServerResponse) {
  if (span && req) {
    const { pathname, host, protocol } = ('path' in req)
      ? parsePath(cleanDoubleSlashes(req.path))
      : parseURL(cleanDoubleSlashes(req.originalUrl ?? req.url))

    const url = (req instanceof ClientRequest)
      ? withBase(pathname, `${req.protocol ?? protocol}//${req.host ?? host}`)
      : pathname

    if (url) {
      const method = req.method
      const name   = replaceId(method ? `${method} ${url}` : url)

      span.setTag('resource.name', name)

      if (req instanceof IncomingMessage) {
        const auth   = req.headers.authorization
        const ua     = req.headers['user-agent']
        const screen = req.headers['x-browser-screen']

        if (auth)
          span.setTag('user.privy_id', parseJWT(auth)?.privy_id)

        if (ua)
          span.setTag('user.browser', parseUA(ua))

        if (screen)
          span.setTag('user.screen', parseScreen(screen as string))

        if (req.body)
          span.setTag('http.request.body', req.body)

        if (res?.body)
          span.setTag('http.response.body', res.body)
      }
    }
  }
}

const tracer = ddTrace.init({ logInjection: true })

tracer.use('net', false)

tracer.use('dns', false)

tracer.use('pino', true)

tracer.use('http', {
  blocklist: [
    '/favicon.ico',
    '/robots.txt',
    '/ping',
    (path) => path.startsWith('/_'),
    ...useRuntimeConfig().pong.tracerBlocklist,
  ],
  hooks  : { request: traceRequest },
  headers: TRACE_HEADERS,
})

tracer.use('fetch', {
  hooks  : { request: traceRequest },
  headers: TRACE_HEADERS,
})

export default tracer
