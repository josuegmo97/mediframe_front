/**
 * Utilidades para leer el payload de un JWT sin verificar firma (solo lectura de `exp`).
 */
function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJwt(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

/** Expiración en milisegundos epoch, o null si no hay `exp` legible. */
export function getTokenExpiryMs(token) {
  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== 'number') return null
  return payload.exp * 1000
}

/**
 * Un token sin `exp` legible se considera expirado (no se confía en él).
 * `skewMs` adelanta la expiración para cubrir desfase de reloj.
 */
export function isTokenExpired(token, skewMs = 5000, now = Date.now()) {
  const exp = getTokenExpiryMs(token)
  if (exp == null) return true
  return exp - skewMs <= now
}

/** Milisegundos restantes de vida del token (puede ser negativo). */
export function getTokenRemainingMs(token, now = Date.now()) {
  const exp = getTokenExpiryMs(token)
  if (exp == null) return 0
  return exp - now
}
