import PinoHttp, { type HttpLogger } from 'pino-http'
import { useRuntimeConfig } from '#imports'
import {
  createEvent,
  getHeader,
  getRequestURL,
  getResponseStatus,
} from 'h3'
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
      redact    : config.pong.loggerRedact,
      formatters: {
        level: (label) => {
          return { level: label }
        },
      },
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
        const event = createEvent(req, res)
        const ua    = getHeader(event, 'User-Agent')
        const auth  = getHeader(event, 'Authorization')

        return {
          browser: ua ? parseUA(ua) : { browser: 'unknown', version: 'unknown' },
          user   : auth?.startsWith('Bearer') ? extractJWT(auth) : undefined,
          http   : {
            request_id : req.id,
            version    : req.httpVersion,
            method     : req.method,
            url        : getRequestURL(event).href,
            status_code: getResponseStatus(event),
            referer    : getHeader(event, 'Referer'),
            useragent  : ua,
          },
        }
      },
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
      },
      customSuccessObject (req, res, val) {
        return {
          ...val,
          duration: val.responseTime * 1_000_000,
        }
      },
      customErrorObject (req, res, error, val) {
        return {
          ...val,
          duration: val.responseTime * 1_000_000,
        }
      },
    })

    logger = pinoHttp
  }

  return logger
}
