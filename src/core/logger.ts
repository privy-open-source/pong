import PinoHttp from 'pino-http'
import tracer from './tracer'
import { useRuntimeConfig } from '#imports'
import { createEvent, getHeader } from 'h3'
import { nanoid } from 'nanoid'
import { parseUA } from 'browserslist-ua-parser'

let logger: ReturnType<typeof PinoHttp>

export function useLogger () {
  if (!logger) {
    const config = useRuntimeConfig()
    const pino   = PinoHttp({
      redact: config.pong.loggerRedact,
      genReqId (req, res) {
        const event = createEvent(req, res)
        const reqId = getHeader(event, 'X-Request-Id')

        return reqId ?? nanoid()
      },
      customProps (req, res) {
        const event = createEvent(req, res)
        const span  = tracer.scope().active()
        const ua    = getHeader(event, 'User-Agent')

        return {
          'dd-span-id' : span?.context().toSpanId(),
          'dd-trace-id': span?.context().toTraceId(),
          'browser'    : ua ? parseUA(ua) : { browser: 'unknown', version: 'unknown' },
        }
      },
    })

    logger = pino
  }

  return logger
}
