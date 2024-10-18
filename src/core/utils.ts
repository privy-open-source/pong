import destr from 'destr'

export const UUID_REGEX = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/gi

export const PRIVYID_REGEX = /^[a-z]{2,}\d{4,}$/gi

export const ID_REGEX = /^[\da-f]+$/gi

/**
 * Replace ID or UUID in URL to "{id}""
 * @param name
 * @returns
 */
export function replaceId (name: string) {
  return name
    .split('/')
    .map((path) => {
      return path
        .replaceAll(UUID_REGEX, '{uuid}')
        .replaceAll(ID_REGEX, '{id}')
        .replaceAll(PRIVYID_REGEX, '{privy_id}')
    })
    .join('/')
}

/**
 * Check is valid UUID
 * @param value
 * @returns
 */
export function isUUID (value: string) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

/**
 * Parse and extract data user from JWT token
 * @param header header string
 */
export function parseJWT (header: string) {
  const [, token]   = header.split(' ')
  const [, payload] = token.split('.')

  return destr<any>(Buffer.from(payload, 'base64').toString('utf8'))
    ?.user
}

/**
 * Parse X-Browser-Screen
 * @param header
 * @returns
 */
export function parseScreen (header: string) {
  const [width, height] = header.split('x')

  return { width, height }
}

export function formatBytes (bytes: unknown, decimals = 2) {
  if (typeof bytes !== 'number')
    return bytes

  if (!+bytes)
    return '0 Bytes'

  const k     = 1024
  const dm    = decimals < 0 ? 0 : decimals
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatAllBytes (object: Record<string, unknown>, decimals?: number): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(object)
      .map(([key, value]) => {
        return [
          key,
          value && typeof value === 'object'
            ? formatAllBytes(value as any, decimals)
            : formatBytes(value, decimals),
        ]
      }),
  )
}
