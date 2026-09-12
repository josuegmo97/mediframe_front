/**
 * Normalización de errores HTTP/axios a un `ApiError` con mensaje en español.
 *
 * El backend responde normalmente `{ success:false, error:{ code, message, details? } }`,
 * pero hay excepciones que aquí se absorben: `error` como string (HMAC), 429 en texto
 * plano (/api/auth y /api/users), HTML de gateway, errores de red y timeouts.
 */

export class ApiError extends Error {
  constructor({ status = null, code = 'ERROR', message, details = [], fieldErrors = {}, raw = null, flags = {} } = {}) {
    super(message || 'Ocurrió un error inesperado')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.fieldErrors = fieldErrors
    this.raw = raw
    this.isNetwork = Boolean(flags.isNetwork)
    this.isTimeout = Boolean(flags.isTimeout)
    this.isCancelled = Boolean(flags.isCancelled)
    this.isRateLimited = status === 429
    this.isAuth = status === 401
    this.isForbidden = status === 403
    this.isNotFound = status === 404
    this.isValidation = code === 'VALIDATION_ERROR'
    this.isServer = typeof status === 'number' && status >= 500
    this.handled = Boolean(flags.handled)
  }
}

/** Códigos del backend que apuntan a un campo concreto de formulario. */
export const CODE_TO_FIELD = {
  REGISTER_004: 'username',
  REGISTER_005: 'email',
  USER_004: 'username',
  USER_005: 'email',
  USER_011: 'email',
  USER_012: 'status',
  USER_013: 'role',
  USER_014: 'password',
  USER_017: 'email',
  USER_018: 'password',
  LOGIN_002: 'password',
  LOGIN_003: 'password',
}

/** Mensajes amigables que reemplazan el texto técnico del backend. */
export const MESSAGES_BY_CODE = {
  LOGIN_002: 'Usuario o contraseña incorrectos.',
  LOGIN_003: 'Usuario o contraseña incorrectos.',
  LOGIN_004: 'Tu cuenta aún no ha sido activada por un administrador.',
  REGISTER_004: 'Ese nombre de usuario ya está en uso.',
  REGISTER_005: 'Ese correo ya está en uso.',
  USER_004: 'Ese nombre de usuario ya está en uso.',
  USER_005: 'Ese correo ya está en uso.',
  USER_011: 'Ese correo ya lo usa otro usuario.',
  USER_017: 'Ese correo ya lo usa otro usuario.',
  AUTH_001: 'Debes iniciar sesión para continuar.',
  AUTH_002: 'Tu sesión ya no es válida. Inicia sesión de nuevo.',
  AUTH_003: 'Tu cuenta está inactiva. Contacta a un administrador.',
  AUTH_004: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  AUTH_005: 'Tu sesión expiró. Inicia sesión de nuevo.',
  AUTH_009: 'Tu cuenta está inactiva. Contacta a un administrador.',
  AUTH_007: 'Esta acción requiere rol de administrador.',
  AUTH_010: 'Esta acción requiere rol de administrador.',
  JWT_ERROR: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  TOKEN_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  LICENSE_003: 'No se pudo generar un código único. Inténtalo de nuevo.',
  LICENSE_004: 'Licencia no encontrada.',
  LICENSE_005: 'Licencia no encontrada.',
  LICENSE_006: 'Solo se pueden eliminar licencias disponibles.',
  ATC_005: 'Mensaje de soporte no encontrado.',
  CONTACT_001: 'Contacto no encontrado.',
  USAGE_001: 'No hay telemetría para este dispositivo.',
  USER_008: 'Usuario no encontrado.',
  USER_010: 'Usuario no encontrado.',
  CAST_ERROR: 'El identificador no es válido.',
  NOT_FOUND: 'No encontramos lo que buscas.',
  RATE_LIMITED: 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.',
  NETWORK: 'No se pudo conectar con el servidor. Revisa tu conexión.',
  TIMEOUT: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  INTERNAL_ERROR: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
  LAMBDA_ERROR: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
}

const MESSAGES_BY_STATUS = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  409: 'La operación entra en conflicto con el estado actual.',
  429: MESSAGES_BY_CODE.RATE_LIMITED,
  500: MESSAGES_BY_CODE.INTERNAL_ERROR,
  502: 'El servidor no está disponible en este momento.',
  503: 'El servidor no está disponible en este momento.',
  504: MESSAGES_BY_CODE.TIMEOUT,
}

function messageForStatus(status) {
  if (MESSAGES_BY_STATUS[status]) return MESSAGES_BY_STATUS[status]
  if (status >= 500) return MESSAGES_BY_CODE.INTERNAL_ERROR
  return 'Ocurrió un error inesperado.'
}

function buildFieldErrors(code, details) {
  const fieldErrors = {}
  for (const detail of details) {
    const field = detail?.field ?? detail?.path
    if (field && detail?.message && !fieldErrors[field]) fieldErrors[field] = detail.message
  }
  const mapped = CODE_TO_FIELD[code]
  if (mapped && !fieldErrors[mapped]) fieldErrors[mapped] = MESSAGES_BY_CODE[code] || null
  return fieldErrors
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error

  if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError') {
    return new ApiError({ code: 'CANCELLED', message: 'Solicitud cancelada.', raw: error, flags: { isCancelled: true, handled: true } })
  }

  const response = error?.response
  if (!response) {
    const isTimeout = error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
    return new ApiError({
      code: isTimeout ? 'TIMEOUT' : 'NETWORK',
      message: isTimeout ? MESSAGES_BY_CODE.TIMEOUT : MESSAGES_BY_CODE.NETWORK,
      raw: error,
      flags: { isNetwork: true, isTimeout },
    })
  }

  const status = Number(response.status) || null
  const body = response.data

  if (status === 429) {
    return new ApiError({ status, code: 'RATE_LIMITED', message: MESSAGES_BY_CODE.RATE_LIMITED, raw: body })
  }

  // Texto plano / HTML (gateway, limiters sin JSON)
  if (body == null || typeof body !== 'object') {
    return new ApiError({ status, code: `HTTP_${status}`, message: messageForStatus(status), raw: body })
  }

  // `error` como string (rutas HMAC)
  if (typeof body.error === 'string') {
    return new ApiError({ status, code: 'ERROR', message: body.error || messageForStatus(status), raw: body })
  }

  const errorObj = body.error && typeof body.error === 'object' ? body.error : {}
  const code = errorObj.code || body.code || `HTTP_${status}`
  const details = Array.isArray(errorObj.details) ? errorObj.details : []
  const fieldErrors = buildFieldErrors(code, details)

  let message = MESSAGES_BY_CODE[code]
  if (!message) {
    if (code === 'VALIDATION_ERROR' && details.length) {
      message = details.map((d) => d?.message).filter(Boolean).join(' ')
    } else {
      message = errorObj.message || body.message || messageForStatus(status)
    }
  }

  return new ApiError({ status, code, message, details, fieldErrors, raw: body })
}

export function getErrorMessage(error, fallback) {
  const normalized = normalizeApiError(error)
  return normalized.message || fallback || 'Ocurrió un error inesperado.'
}

/**
 * Aplica errores de campo a react-hook-form. Devuelve true si al menos un campo
 * conocido recibió error (si no, el llamador debe mostrar el mensaje general).
 */
export function applyFieldErrors(setError, error, knownFields = []) {
  const normalized = normalizeApiError(error)
  let applied = false
  for (const [field, message] of Object.entries(normalized.fieldErrors)) {
    if (!knownFields.length || knownFields.includes(field)) {
      setError(field, { type: 'server', message: message || normalized.message })
      applied = true
    }
  }
  return applied
}
