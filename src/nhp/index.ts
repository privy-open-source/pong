/* eslint-disable @typescript-eslint/triple-slash-reference */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { type ApiServer as NHPApiServer } from '@privyid/nhp/core'
import { destr } from 'destr'
import { defu } from 'defu'
import { responseInterceptor, fixRequestBody } from 'http-proxy-middleware'
import parseContentType from 'fast-content-type-parse'
import { env } from 'std-env'
import { useRuntimeConfig } from '#imports'
import { isUUID } from '../core/utils'
import { v4 as uuidv4 } from 'uuid'

/**
 * Inject special headers
 * @param onProxyReq
 * @returns
 */
function withSpecialHeader (onProxyReq: ApiServer['onProxyReq']): ApiServer['onProxyReq'] {
  return (proxyReq, req, res, options) => {
    if (!req.headers['x-platform-name'])
      proxyReq.setHeader('x-platform-name', env.APP_PLATFORM_NAME || env.PLATFORM_NAME || '')

    if (!req.headers['x-platform-type'])
      proxyReq.setHeader('X-Platform-Type', env.APP_PLATFORM_TYPE || env.PLATFORM_TYPE || '')

    if (!req.headers['x-application-name'])
      proxyReq.setHeader('x-application-name', env.APP_NAME || '')

    if (!req.headers['x-application-version'])
      proxyReq.setHeader('x-application-version', env.APP_VERSION || env.BUILD_VERSION || '1.0.0')

    if (!req.headers['x-request-id'] || !isUUID(req.headers['x-request-id'] as string))
      proxyReq.setHeader('x-request-id', uuidv4())

    if (onProxyReq)
      onProxyReq(proxyReq, req, res, options)
  }
}

/**
 * Fix proxy request body because body-parser middleware
 * @param onProxyReq
 * @returns
 */
function withRequestBodyFix (onProxyReq: ApiServer['onProxyReq']): ApiServer['onProxyReq'] {
  return (proxyReq, req, res, options) => {
    fixRequestBody(proxyReq, req)

    if (onProxyReq)
      onProxyReq(proxyReq, req, res, options)
  }
}

/**
 * Parse proxy response body
 * @param onProxyRes
 * @returns
 */
function withResponseBodyParse (onProxyRes: ApiServer['onProxyRes']): ApiServer['onProxyRes'] {
  return responseInterceptor(async (buffer, proxyRes, req, res) => {
    if (onProxyRes)
      onProxyRes(proxyRes, req as any, res as any)

    if (proxyRes.headers['content-type']) {
      const {
        type,
        parameters,
      } = parseContentType.safeParse(proxyRes.headers['content-type'])

      if (type === 'application/json')
        res.body = destr(buffer.toString(parameters.charset as any))
    }

    return buffer
  }) as unknown as ApiServer['onProxyRes']
}

export interface ApiServer extends NHPApiServer {
  /**
   * Inject special header
   * @default true
   */
  injectHeader?: boolean,
  /**
   * @default true
   */
  traceResBody?: boolean,
}

/**
 * Define proxy server (with Tracer Body)
 * @param servers
 * @returns
 */
export function defineServer (servers: ApiServer[]): NHPApiServer[] {
  const config = useRuntimeConfig()

  return servers.map((server) => {
    let onProxyReq = server.onProxyReq
    let onProxyRes = server.onProxyRes

    if (server.injectHeader !== false)
      onProxyReq = withSpecialHeader(onProxyReq)

    if (config.pong.traceReqBody)
      onProxyReq = withRequestBodyFix(onProxyReq)

    const isTraceResBody = config.pong.traceResBody
      && server.traceResBody !== false

    if (isTraceResBody)
      onProxyRes = withResponseBodyParse(onProxyRes)

    return defu<ApiServer, [ApiServer]>({
      selfHandleResponse: isTraceResBody,
      onProxyReq,
      onProxyRes,
    }, server)
  })
}

export {
  defineEventInterceptor,
} from '@privyid/nhp/core'
