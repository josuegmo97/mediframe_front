import { LICENSE_STATUS } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { deviceLabel, parseDeviceDescription } from '@/lib/device-description'
import { formatDateTime } from '@/lib/format'
import { effectiveLicenseStatus, formatLicenseCode, licenseCodeMatches, licenseDaysRemaining, licenseStatusMeta } from '@/lib/license-code'

const normalize = (value) => String(value ?? '').toLowerCase()

export const EXPIRING_SOON_DAYS = 7

export function isExpiringSoon(license, now = Date.now()) {
  const days = licenseDaysRemaining(license, now)
  return days != null && days <= EXPIRING_SOON_DAYS
}

/** Filtro en cliente. estado: '' | '1' | '2' | '3'; dias: '' | número; pronto: '' | '1'. */
export function filterLicenses(licenses, { q = '', estado = '', dias = '', pronto = '' } = {}, now = Date.now()) {
  const query = normalize(q).trim()
  return (licenses ?? []).filter((license) => {
    const status = effectiveLicenseStatus(license, now)
    if (estado !== '' && String(status) !== String(estado)) return false
    if (dias !== '' && String(license.days_permission) !== String(dias)) return false
    if (pronto === '1' && !isExpiringSoon(license, now)) return false
    if (!query) return true
    return (
      licenseCodeMatches(license.code, query) ||
      normalize(license.device).includes(query) ||
      normalize(license.owner_name).includes(query) ||
      normalize(license.owner_email).includes(query) ||
      normalize(license.owner_identification).includes(query) ||
      normalize(license.owner_phone).includes(query) ||
      normalize(license.description).includes(query) ||
      normalize(deviceLabel(license.device_description, '')).includes(query)
    )
  })
}

export function computeStats(licenses, now = Date.now()) {
  const stats = { total: 0, available: 0, inUse: 0, expired: 0, expiringSoon: 0 }
  for (const license of licenses ?? []) {
    stats.total += 1
    const status = effectiveLicenseStatus(license, now)
    if (status === LICENSE_STATUS.AVAILABLE) stats.available += 1
    else if (status === LICENSE_STATUS.IN_USE) {
      stats.inUse += 1
      if (isExpiringSoon(license, now)) stats.expiringSoon += 1
    } else if (status === LICENSE_STATUS.EXPIRED) stats.expired += 1
  }
  return stats
}

export function distinctDays(licenses) {
  return [...new Set((licenses ?? []).map((l) => Number(l.days_permission)).filter((n) => Number.isFinite(n)))].sort((a, b) => a - b)
}

export function licensesToCsv(licenses) {
  return toCsv(licenses, [
    { header: 'CÓDIGO', accessor: (l) => formatLicenseCode(l.code) },
    { header: 'ESTADO', accessor: (l) => licenseStatusMeta(effectiveLicenseStatus(l)).label },
    { header: 'DÍAS', accessor: 'days_permission' },
    { header: 'DÍAS RESTANTES', accessor: (l) => licenseDaysRemaining(l) ?? '' },
    { header: 'EXPIRA', accessor: (l) => formatDateTime(l.expired_at) },
    { header: 'DESCRIPCIÓN', accessor: (l) => l.description ?? '' },
    { header: 'PROPIETARIO', accessor: (l) => l.owner_name ?? '' },
    { header: 'IDENTIFICACIÓN', accessor: (l) => l.owner_identification ?? '' },
    { header: 'TELÉFONO', accessor: (l) => l.owner_phone ?? '' },
    { header: 'CORREO', accessor: (l) => l.owner_email ?? '' },
    { header: 'DISPOSITIVO', accessor: (l) => l.device ?? '' },
    { header: 'MODELO', accessor: (l) => parseDeviceDescription(l.device_description)?.modelLabel ?? '' },
    { header: 'EQUIPO', accessor: (l) => parseDeviceDescription(l.device_description)?.computerName ?? '' },
    { header: 'VERSIÓN APP', accessor: (l) => l.version ?? '' },
    { header: 'CREADA POR', accessor: (l) => (typeof l.created_by === 'object' ? l.created_by?.fullname ?? l.created_by?.username ?? '' : '') },
    { header: 'CREADA EL', accessor: (l) => formatDateTime(l.created_at) },
  ])
}

export function codesToText(codes) {
  return codes.map((item) => formatLicenseCode(item.code)).join('\n')
}

export function codesToCsv(codes) {
  return toCsv(codes, [
    { header: 'CÓDIGO', accessor: (item) => formatLicenseCode(item.code) },
    { header: 'DÍAS', accessor: 'days_permission' },
  ])
}

export function createdByLabel(license) {
  const by = license?.created_by
  if (!by) return null
  if (typeof by === 'string') return null
  return by.fullname ? `${by.fullname}${by.username ? ` (@${by.username})` : ''}` : by.username ?? null
}

/** Fecha aproximada de activación: expired_at − days_permission. */
export function approximateActivationDate(license) {
  if (!license?.expired_at || !license.days_permission) return null
  const expires = new Date(license.expired_at).getTime()
  if (Number.isNaN(expires)) return null
  return new Date(expires - Number(license.days_permission) * 86_400_000)
}
