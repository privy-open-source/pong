import PinoHttp from 'pino-http'
import { type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

let logger: ReturnType<typeof PinoHttp>

export function useLogger () {
  if (!logger) {
    const config = useRuntimeConfig()
    const pino   = PinoHttp({ redact: config.pong.loggerRedact })

    logger = pino
  }

  return logger
}

export function sendLog (event: H3Event) {
  useLogger()(event.node.req, event.node.res)
}
