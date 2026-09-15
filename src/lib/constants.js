export const APP_NAME = 'MediFrame'
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'

export const STORAGE_KEYS = {
  token: 'mf.token',
  theme: 'mf.theme',
}

export const ROLE = { ADMIN: 1, VIEWER: 2 }
export const ROLE_LABEL = { 1: 'Administrador', 2: 'Espectador' }

export const USER_STATUS = { INACTIVE: 0, ACTIVE: 1 }
export const USER_STATUS_LABEL = { 0: 'Inactivo', 1: 'Activo' }

export const LICENSE_STATUS = { AVAILABLE: 1, IN_USE: 2, EXPIRED: 3 }
export const LICENSE_STATUS_META = {
  1: { label: 'Disponible', tone: 'success' },
  2: { label: 'En uso', tone: 'info' },
  3: { label: 'Expirada', tone: 'danger' },
}

export const ATC_STATUS = { PENDING: 0, HANDLED: 1 }
export const ATC_STATUS_META = {
  0: { label: 'Pendiente', tone: 'warning' },
  1: { label: 'Atendido', tone: 'success' },
}

export const CONTACT_STATUS = { PENDING: 0, CONTACTED: 1 }
export const CONTACT_STATUS_META = {
  0: { label: 'Pendiente', tone: 'warning' },
  1: { label: 'Contactado', tone: 'success' },
}

export const USAGE_TRIGGER_LABEL = {
  patients: 'Nuevo paciente',
  histories: 'Nueva historia',
  users: 'Nuevo usuario',
  pdf: 'PDF generado',
  flush: 'Sincronización',
}

/** Dictado por voz: estado efectivo que ve la app (`state`) y motivo (`reason_code`). */
export const VOICE_REPORT_STATE_META = {
  available: { label: 'Disponible', tone: 'success' },
  blocked: { label: 'Bloqueado', tone: 'danger' },
  hidden: { label: 'Oculto', tone: 'neutral' },
}
export const VOICE_REPORT_REASON_LABEL = {
  FEATURE_DISABLED: 'Función apagada globalmente',
  DEVICE_NOT_ALLOWED: 'Dispositivo no habilitado',
  LICENSE_INVALID: 'Sin licencia vigente',
  BLOCKED_BY_ADMIN: 'Bloqueado por el administrador',
  QUOTA_EXCEEDED: 'Cuota del período agotada',
}
export const VOICE_REPORT_PERIOD_LABEL = { monthly: 'Mensual', daily: 'Diario' }
export const VOICE_REPORT_USAGE_STATUS_META = {
  success: { label: 'Exitoso', tone: 'success' },
  error: { label: 'Error', tone: 'danger' },
}
export const VOICE_REPORT_ERROR_LABEL = {
  FEATURE_DISABLED: 'Función apagada',
  DEVICE_NOT_ALLOWED: 'Dispositivo no habilitado',
  LICENSE_INVALID: 'Licencia inválida',
  BLOCKED_BY_ADMIN: 'Bloqueado por admin',
  QUOTA_EXCEEDED: 'Cuota agotada',
  INVALID_AUDIO: 'Audio inválido',
  AUDIO_TOO_LARGE: 'Audio demasiado grande',
  TRANSCRIPTION_FAILED: 'Falló la transcripción',
  SESSION_FAILED: 'Falló la sesión',
  VALIDATION_ERROR: 'Datos inválidos',
}
export const VOICE_REPORT_LANGUAGE_LABEL = {
  es: 'Español', en: 'Inglés', pt: 'Portugués', ja: 'Japonés', zh: 'Chino', fr: 'Francés', ru: 'Ruso',
  pl: 'Polaco', hu: 'Húngaro', de: 'Alemán', ar: 'Árabe', it: 'Italiano', he: 'Hebreo',
}

export const LICENSE_DAY_PRESETS = [30, 90, 180, 365]
export const PAGE_SIZES = [10, 20, 50]
export const DEFAULT_PAGE_SIZE = 20

/** Ventana de los rate limiters del backend (15 min), para mensajes al usuario. */
export const RATE_LIMIT_WINDOW_MINUTES = 15
