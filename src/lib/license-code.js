import { LICENSE_STATUS, LICENSE_STATUS_META } from './constants'

/** Deja solo A-Z y 0-9 en mayúsculas (para buscar y comparar códigos). */
export function normalizeLicenseCode(input) {
  return String(input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** 1234567890123456 → 1234-5678-9012-3456. Códigos de otra longitud se devuelven tal cual. */
export function formatLicenseCode(code) {
  if (code == null) return ''
  const normalized = normalizeLicenseCode(code)
  if (normalized.length !== 16) return String(code)
  return normalized.match(/.{1,4}/g).join('-')
}

/**
 * Estado efectivo: una licencia "en uso" cuya `expired_at` ya pasó se muestra como
 * expirada aunque el backend aún no haya ejecutado su barrido perezoso.
 */
export function effectiveLicenseStatus(license, now = Date.now()) {
  if (!license) return null
  const status = Number(license.status)
  if (status === LICENSE_STATUS.IN_USE && license.expired_at) {
    const expiresAt = new Date(license.expired_at).getTime()
    if (!Number.isNaN(expiresAt) && expiresAt < now) return LICENSE_STATUS.EXPIRED
  }
  return status
}

/** Días restantes (entero ≥ 0) o null si la licencia no está en uso. */
export function licenseDaysRemaining(license, now = Date.now()) {
  if (!license || effectiveLicenseStatus(license, now) !== LICENSE_STATUS.IN_USE) return null
  if (typeof license.days_remaining === 'number') return Math.max(0, license.days_remaining)
  if (!license.expired_at) return null
  const expiresAt = new Date(license.expired_at).getTime()
  if (Number.isNaN(expiresAt)) return null
  return Math.max(0, Math.floor((expiresAt - now) / 86_400_000))
}

export function licenseStatusMeta(status) {
  return LICENSE_STATUS_META[Number(status)] ?? { label: 'Desconocido', tone: 'neutral' }
}

/** Coincidencia de un texto libre contra un código (ignora guiones y mayúsculas). */
export function licenseCodeMatches(code, query) {
  const q = normalizeLicenseCode(query)
  if (!q) return false
  return normalizeLicenseCode(code).includes(q)
}
