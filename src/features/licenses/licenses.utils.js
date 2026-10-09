import { LICENSE_STATUS } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { deviceLabel, parseDeviceDescription } from '@/lib/device-description'
import { formatDateTime } from '@/lib/format'
import { effectiveLicenseStatus, formatLicenseCode, licenseCodeMatches, licenseDaysRemaining, licenseStatusMeta } from '@/lib/license-code'

const normalize = (value) => String(value ?? '').toLowerCase()

export const EXPIRING_SOON_DAYS = 7

/** Pausada por un administrador: la app la trata como "cuenta en mantenimiento". */
export function isLicensePaused(license, now = Date.now()) {
  return Boolean(license?.paused) && effectiveLicenseStatus(license, now) === LICENSE_STATUS.IN_USE
}

export function isExpiringSoon(license, now = Date.now()) {
  const days = licenseDaysRemaining(license, now)
  return days != null && days <= EXPIRING_SOON_DAYS
}

/** Filtro en cliente. estado: '' | '1' | '2' | '3' | 'pausada'; dias: '' | número; pronto: '' | '1'. */
export function filterLicenses(licenses, { q = '', estado = '', dias = '', pronto = '' } = {}, now = Date.now()) {
  const query = normalize(q).trim()
  return (licenses ?? []).filter((license) => {
    const status = effectiveLicenseStatus(license, now)
    if (estado === 'pausada') {
      if (!isLicensePaused(license, now)) return false
    } else if (estado !== '' && String(status) !== String(estado)) return false
    if (dias !== '' && String(license.days_permission) !== String(dias)) return false
    if (pronto === '1' && !isExpiringSoon(license, now)) return false
    return matchesLicenseQuery(license, query)
  })
}

/** `query` ya normalizado (minúsculas, sin espacios extremos); vacío coincide con todo. */
function matchesLicenseQuery(license, query) {
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
}

const byDateDesc = (getDate) => (a, b) => new Date(getDate(b) ?? 0) - new Date(getDate(a) ?? 0)

/** Aceptaciones de la solicitud vigente (el backend borra las anteriores al volver a solicitar o cancelar). */
export function currentTermsAcceptances(license) {
  if (!license?.terms_request_id) return []
  return (license.terms_acceptances ?? []).filter((item) => item.request_id === license.terms_request_id)
}

/** Licencias con una solicitud de términos vigente, la más reciente primero. */
export function licensesWithTermsRequest(licenses) {
  return (licenses ?? []).filter((license) => license.terms_request_id).sort(byDateDesc((license) => license.terms_requested_at))
}

export function computeTermsStats(licenses) {
  const stats = { requested: 0, accepted: 0, pending: 0, acceptances: 0 }
  for (const license of licensesWithTermsRequest(licenses)) {
    const count = currentTermsAcceptances(license).length
    stats.requested += 1
    stats.acceptances += count
    if (count > 0) stats.accepted += 1
    else stats.pending += 1
  }
  return stats
}

/** Solicitudes vigentes filtradas. estado: '' | 'pendiente' (nadie aceptó) | 'aceptada' (al menos una aceptación). */
export function filterTermsLicenses(licenses, { q = '', estado = '' } = {}) {
  const query = normalize(q).trim()
  return licensesWithTermsRequest(licenses).filter((license) => {
    const accepted = currentTermsAcceptances(license).length > 0
    if (estado === 'pendiente' && accepted) return false
    if (estado === 'aceptada' && !accepted) return false
    return matchesLicenseQuery(license, query)
  })
}

/** Una fila por aceptación vigente (con su licencia), la más reciente primero. tipo: '' | 'titular' | 'sub'. */
export function termsAcceptanceRows(licenses, { q = '', tipo = '' } = {}) {
  const query = normalize(q).trim()
  const rows = []
  for (const license of licensesWithTermsRequest(licenses)) {
    currentTermsAcceptances(license).forEach((acceptance, index) => {
      if (tipo === 'titular' && acceptance.is_sub_user) return
      if (tipo === 'sub' && !acceptance.is_sub_user) return
      if (query && !normalize(acceptance.user_name).includes(query) && !matchesLicenseQuery(license, query)) return
      rows.push({ _id: `${license._id}-${index}`, license, ...acceptance })
    })
  }
  return rows.sort(byDateDesc((row) => row.accepted_at))
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
    { header: 'ESTADO', accessor: (l) => (isLicensePaused(l) ? 'Pausada' : licenseStatusMeta(effectiveLicenseStatus(l)).label) },
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
