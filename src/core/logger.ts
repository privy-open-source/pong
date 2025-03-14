import tracer from 'dd-trace'
import type { IncomingMessage, ServerResponse } from 'node:http'
import PinoHttp, { type HttpLogger } from 'pino-http'
import { useRuntimeConfig } from '#imports'
import {
  createEvent,
  getHeader,
} from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { isUUID } from './utils'

let logger: HttpLogger<IncomingMessage, ServerResponse, 'error' | 'warn' | 'silent' | 'info'>

export function useLogger () {
  if (!logger) {
    const config   = useRuntimeConfig()
    const pinoHttp = PinoHttp({
      redact: config.pong.loggerRedact,
      mixin : (context, _) => {
        if (config.pong.tracer) {
          const span = tracer.scope().active()

          if (span)
            tracer.inject(span.context(), 'log', context)
        }

        return context
      },
      genReqId (req, res) {
        const event = createEvent(req, res)
        const reqId = getHeader(event, 'X-Request-Id')

        return reqId && isUUID(reqId) ? reqId : uuidv4()
      },
      customLogLevel (req, res, err) {
        const { logLevelThreshold } = config.pong

        if (res.statusCode >= 500 || err)
          return 'error'
        else if (res.statusCode >= 400 && res.statusCode < 500) {
          if (logLevelThreshold === 'error')
            return 'silent'
          return 'warn'
        } else if (res.statusCode >= 300 && res.statusCode < 400)
          return 'silent'

        return logLevelThreshold === 'error' || logLevelThreshold === 'warn' ? 'silent' : 'info'
      },
    })

    logger = pinoHttp
  }

  return logger
}
