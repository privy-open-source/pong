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
        const event   = createEvent(req, res)
        const span    = tracer.scope().active()
        const context = span?.context()
        const ua      = getHeader(event, 'User-Agent')

        return {
          'dd-span-id'     : context?.toSpanId(),
          'dd-trace-id'    : context?.toTraceId(),
          'dd-trace-parent': context?.toTraceparent(),
          'browser'        : ua ? parseUA(ua) : { browser: 'unknown', version: 'unknown' },
        }
      },
    })

    logger = pino
  }

  return logger
}
