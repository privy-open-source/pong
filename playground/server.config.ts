import { getCookie, setHeader } from 'h3'
import { defineServer, defineEventInterceptor } from '../src/nhp'

export default defineServer([
  {
    name     : 'example',
    baseUrl  : '/api/example',
    targetUrl: 'https://reqres.in/api/',
  },
  {
    name      : 'bin',
    baseUrl   : '/api/bin',
    targetUrl : 'https://httpbin.org',
    onProxyReq: defineEventInterceptor((proxyEvent, event) => {
      const token = getCookie(event, 'session/token')

      if (token)
        setHeader(proxyEvent, 'Authorization', `Bearer ${token}`)
    }),
  },
  {
    name          : 'force-download',
    baseUrl       : '/force/download',
    proxyType     : 'dynamic',
    allowFrom     : ['dummyjson.com'],
    downloadExt   : '.pdf',
    downloadHeader: true,
  },
])
