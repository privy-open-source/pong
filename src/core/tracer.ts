import ddTrace from 'dd-trace'
import {
  type ServerResponse,
  ClientRequest,
  IncomingMessage,
} from 'node:http'
import { parsePath, withBase } from 'ufo'
import { createEvent, getRequestURL } from 'h3'
import { replaceId } from './utils'

const tracer = ddTrace.init({ logInjection: true })

function traceInBound (span: ddTrace.Span, req: IncomingMessage, res: ServerResponse<IncomingMessage>) {
  const event = createEvent(req, res)
  const url   = getRequestURL(event)
  const name  = replaceId(`${event.method} ${url.pathname}`)

  span.setTag('resource.name', name)
}

function traceOutBound (span: ddTrace.Span, req: ClientRequest, _res?: IncomingMessage) {
  const path = parsePath(req.path)
  const url  = withBase(path.pathname, `${req.protocol}://${req.host}`)
  const name = replaceId(`${req.method} ${url}`)

  span.setTag('resource.name', name)
}

tracer.use('net', false)

tracer.use('dns', false)

tracer.use('pino', false)

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
        if (req instanceof IncomingMessage)
          traceInBound(span, req, res as ServerResponse<IncomingMessage>)

        if (req instanceof ClientRequest)
          traceOutBound(span, req, res as IncomingMessage)
      }
    },
  },
})

tracer.use('fetch', {
  hooks: {
    request (span, req, res) {
      if (req && span)
        traceOutBound(span, req, res)
    },
  },
})

export default tracer
