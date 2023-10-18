import PinoHttp, { type HttpLogger } from 'pino-http'
import tracer from './tracer'
import { useRuntimeConfig } from '#imports'
import { createEvent, getHeader } from 'h3'
import { nanoid } from 'nanoid'
import { parseUA } from 'browserslist-ua-parser'
import destr from 'destr'

let logger: HttpLogger

/**
 * Extract user from JWT token
 * @param header header string
 */
function extractJWT (header: string) {
  const [, token]   = header.split(' ')
  const [, payload] = token.split('.')

  return destr<any>(Buffer.from(payload, 'base64').toString('utf8'))
    ?.user
}

export function useLogger () {
  if (!logger) {
    const config   = useRuntimeConfig()
    const pinoHttp = PinoHttp({
      redact: config.pong.loggerRedact,
      genReqId (req, res) {
        const event = createEvent(req, res)
        const reqId = getHeader(event, 'X-Request-Id')

        return reqId ?? nanoid()
      },
      customLogLevel (req, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500)
          return 'warn'
        else if (res.statusCode >= 500 || err)
          return 'error'
        else if (res.statusCode >= 300 && res.statusCode < 400)
          return 'silent'

        return 'info'
      },
      customProps (req, res) {
        const event   = createEvent(req, res)
        const context = tracer.scope().active()?.context()
        const ua      = getHeader(event, 'User-Agent')
        const auth    = getHeader(event, 'Authorization')

        return {
          'dd-span-id'    : context?.toSpanId(),
          'dd-trace-id'   : context?.toTraceId(),
          'dd-traceparent': context?.toTraceparent(),
          'browser'       : ua ? parseUA(ua) : { browser: 'unknown', version: 'unknown' },
          'user'          : auth?.startsWith('Bearer') ? extractJWT(auth) : undefined,
        }
      },
    })

    logger = pinoHttp
  }

  return logger
}
