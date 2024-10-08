import ddTrace, { type Span } from 'dd-trace'
import {
  type ServerResponse,
  type ClientRequest,
  type IncomingMessage,
} from 'node:http'
import { replaceId } from './utils'
import {
  parsePath,
  parseURL,
  withBase,
  cleanDoubleSlashes,
} from 'ufo'

declare module 'http' {
  export interface IncomingMessage {
    originalUrl?: string,
    body?: any,
  }

  export interface ServerResponse {
    body?: any,
  }
}

function traceRequest (span?: Span, req?: IncomingMessage | ClientRequest, res?: IncomingMessage | ServerResponse<IncomingMessage>) {
  if (span && req) {
    const { pathname } = ('path' in req)
      ? parsePath(cleanDoubleSlashes(req.path))
      : parseURL(cleanDoubleSlashes(req.originalUrl ?? req.url))

    const url = ('protocol' in req && 'host' in req)
      ? withBase(pathname, `${req.protocol}//${req.host}`)
      : pathname

    if (url) {
      const method  = req.method
      const name    = replaceId(method ? `${method} ${url}` : url)
      const headers = 'getHeaders' in req ? req.getHeaders() : req.headers
      const id      = headers['x-request-id']

      span.setTag('resource.name', name)
      span.setTag('http.request_id', id)
      span.setTag('http.referer', headers.referer)

      if (res) {
        span.setTag('http.response.status_code', res.statusCode)
        span.setTag('http.response.body', res.body)
      }
    }
  }
}

const tracer = ddTrace.init({ logInjection: true })

tracer.use('net', false)

tracer.use('dns', false)

tracer.use('http', {
  blocklist: [
    '/favicon.ico',
    '/robots.txt',
    '/ping',
    (path) => path.startsWith('/_'),
  ],
  hooks: { request: traceRequest },
})

tracer.use('fetch', { hooks: { request: traceRequest } })

export default tracer
