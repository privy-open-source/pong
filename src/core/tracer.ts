import ddTrace from 'dd-trace'
import {
  type ServerResponse,
  ClientRequest,
  IncomingMessage,
} from 'node:http'
import {
  parsePath,
  withBase,
  withProtocol,
} from 'ufo'
import { createEvent, getRequestURL } from 'h3'
import { replaceId } from './utils'

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
  hooks: {
    request (span, req, res) {
      if (span) {
        if (req instanceof IncomingMessage) {
          const event = createEvent(req, res as ServerResponse<IncomingMessage>)
          const url   = getRequestURL(event)
          const name  = replaceId(`${event.method} ${url.pathname}`)

          span.setTag('resource.name', name)
        }

        if (req instanceof ClientRequest) {
          const path = parsePath(req.path)
          const url  = withBase(path.pathname, withProtocol(req.host, req.protocol))
          const name = replaceId(`${req.method} ${url}`)

          span.setTag('resource.name', name)
        }
      }
    },
  },
})

tracer.use('fetch', {
  hooks: {
    request (span, req, _res) {
      if (span && req instanceof Request) {
        const name = replaceId(`${req.method} ${req.url}`)

        span.setTag('resource.name', name)
      }
    },
  },
})

export default tracer
