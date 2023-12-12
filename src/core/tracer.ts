import ddTrace from 'dd-trace'
import {
  type ServerResponse,
  ClientRequest,
  IncomingMessage,
} from 'node:http'
import { parsePath, withBase } from 'ufo'
import { createEvent, getRequestURL } from 'h3'

const UUID_REGEX = /\/[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}/gi
const ID_REGEX   = /\/\d+/gi

const tracer = ddTrace.init({ logInjection: true })

function replaceId (name: string) {
  return name
    .replaceAll(UUID_REGEX, '/{id}')
    .replaceAll(ID_REGEX, '/{id}')
}

tracer.use('http', {
  hooks: {
    request: (span, req, res) => {
      if (req instanceof IncomingMessage) {
        const event = createEvent(req, res as ServerResponse<IncomingMessage>)
        const url   = getRequestURL(event)
        const name  = replaceId(`${event.method} ${url.pathname}`)

        span?.setTag('resource.name', name)
      }

      if (req instanceof ClientRequest) {
        const path = parsePath(req.path)
        const url  = withBase(path.pathname, req.host)
        const name = replaceId(`${req.method} ${url}`)

        span?.setTag('resource.name', name)
      }
    },
  },
})

export default tracer
