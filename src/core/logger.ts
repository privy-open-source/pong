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

enum LOG_LEVEL {
  'silent' = 0,
  'info' = 1,
  'warn' = 2,
  'error' = 3,
}

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
        const threshold = LOG_LEVEL[config.pong.logLevelThreshold as 'warn' | 'silent' | 'info'] ?? 1

        let level = LOG_LEVEL.info

        if (res.statusCode >= 500 || err)
          level = LOG_LEVEL.error
        else if (res.statusCode >= 400 && res.statusCode < 500)
          level = LOG_LEVEL.warn
        else if (res.statusCode >= 300 && res.statusCode < 400)
          level = LOG_LEVEL.silent

        return (level >= threshold
          ? LOG_LEVEL[level] as 'error' | 'warn' | 'silent' | 'info'
          : 'silent')
      },
    })

    logger = pinoHttp
  }

  return logger
}
