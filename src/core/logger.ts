import PinoHttp, { type HttpLogger } from 'pino-http'
import { useRuntimeConfig } from '#imports'
import {
  createEvent,
  getHeader,
  getRequestURL,
  getResponseStatus,
} from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { parseUA } from 'browserslist-ua-parser'
import {
  parseJWT,
  isUUID,
  parseScreen,
} from './utils'

let logger: HttpLogger

export function useLogger () {
  if (!logger) {
    const config   = useRuntimeConfig()
    const pinoHttp = PinoHttp({
      redact    : config.pong.loggerRedact,
      formatters: {
        level: (label) => {
          return { level: label }
        },
        bindings (bindings) {
          return {
            ...bindings,
            node: { version: process.version },
          }
        },
      },
      genReqId (req, res) {
        const event = createEvent(req, res)
        const reqId = getHeader(event, 'X-Request-Id')

        return reqId && isUUID(reqId) ? reqId : uuidv4()
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
        const event  = createEvent(req, res)
        const ua     = getHeader(event, 'User-Agent')
        const auth   = getHeader(event, 'Authorization')
        const screen = getHeader(event, 'X-Browser-Screen')

        return {
          browser: ua ? parseUA(ua) : { browser: 'unknown', version: 'unknown' },
          screen : screen ? parseScreen(screen) : undefined,
          user   : auth?.startsWith('Bearer') ? parseJWT(auth) : undefined,
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
          error: {
            kind   : val.error.type,
            message: val.error.message,
            stack  : val.error.stack,
          },
          duration: val.responseTime * 1_000_000,
        }
      },
    })

    logger = pinoHttp
  }

  return logger
}
