import destr from 'destr'

export const UUID_REGEX = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/gi

export const UUID_URL_REGEX = /\/[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}/gi

export const PRIVYID_URL_REGEX = /\/[a-z]{2,}\d{4,}/gi

export const ID_URL_REGEX = /\/\d+/gi

/**
 * Replace ID or UUID in URL to "{id}""
 * @param name
 * @returns
 */
export function replaceId (name: string) {
  return name
    .replaceAll(UUID_URL_REGEX, '/:id')
    .replaceAll(ID_URL_REGEX, '/:id')
    .replaceAll(PRIVYID_URL_REGEX, '/:privy-id')
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
