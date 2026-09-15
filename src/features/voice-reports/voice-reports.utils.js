import { VOICE_REPORT_REASON_LABEL, VOICE_REPORT_STATE_META } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { deviceLabel } from '@/lib/device-description'
import { formatDateTime, shortId } from '@/lib/format'
import { licenseCodeMatches } from '@/lib/license-code'

const normalize = (value) => String(value ?? '').toLowerCase()

/** Filtro en cliente. estado: '' | 'available' | 'blocked' | 'hidden'; habilitado: '' | 'si' | 'no'. */
export function filterVoiceReportDevices(items, { q = '', estado = '', habilitado = '' } = {}) {
  const query = normalize(q).trim()
  return (items ?? []).filter((item) => {
    if (estado && item.state !== estado) return false
    if (habilitado === 'si' && !item.enabled) return false
    if (habilitado === 'no' && item.enabled) return false
    if (!query) return true
    const license = item.license ?? {}
    return (
      normalize(item.device_id).includes(query) ||
      normalize(item.notes).includes(query) ||
      licenseCodeMatches(license.code, query) ||
      normalize(license.owner_name).includes(query) ||
      normalize(license.owner_email).includes(query) ||
      normalize(deviceLabel(license.device_description, '')).includes(query)
    )
  })
}

/** Etiqueta legible: modelo · equipo, o el id acortado. */
export function voiceDeviceLabel(item) {
  return deviceLabel(item?.license?.device_description, null) ?? shortId(item?.device_id, 13)
}

export function stateMeta(state) {
  return VOICE_REPORT_STATE_META[state] ?? { label: state ?? 'Desconocido', tone: 'neutral' }
}

export function reasonLabel(code) {
  return code ? VOICE_REPORT_REASON_LABEL[code] ?? code : null
}

/** Porcentaje de cuota consumida (0–100) o null si es ilimitada. */
export function quotaPercent(quota) {
  if (!quota || quota.limit == null || quota.limit === 0) return null
  return Math.min(100, Math.round((quota.used / quota.limit) * 100))
}

export function quotaLabel(quota) {
  if (!quota) return '—'
  return quota.limit == null ? `${quota.used} · sin límite` : `${quota.used} / ${quota.limit}`
}

export function voiceReportDevicesToCsv(items) {
  return toCsv(items, [
    { header: 'DISPOSITIVO', accessor: 'device_id' },
    { header: 'EQUIPO', accessor: (i) => deviceLabel(i.license?.device_description, '') },
    { header: 'LICENCIA', accessor: (i) => i.license?.code ?? '' },
    { header: 'PROPIETARIO', accessor: (i) => i.license?.owner_name ?? '' },
    { header: 'ESTADO', accessor: (i) => stateMeta(i.state).label },
    { header: 'MOTIVO', accessor: (i) => reasonLabel(i.reason_code) ?? '' },
    { header: 'HABILITADO', accessor: (i) => (i.enabled ? 'Sí' : 'No') },
    { header: 'BLOQUEADO', accessor: (i) => (i.blocked_by_admin ? 'Sí' : 'No') },
    { header: 'LÍMITE', accessor: (i) => (i.quota?.limit == null ? 'Sin límite' : i.quota.limit) },
    { header: 'USADOS', accessor: (i) => i.quota?.used ?? 0 },
    { header: 'ERRORES', accessor: (i) => i.period_usage?.errors ?? 0 },
    { header: 'COSTO USD', accessor: (i) => i.period_usage?.cost_usd ?? 0 },
    { header: 'SEGUNDOS', accessor: (i) => i.period_usage?.transcription_seconds ?? 0 },
    { header: 'SESIONES', accessor: (i) => i.period_usage?.sessions ?? 0 },
    { header: 'ACEPTADOS', accessor: (i) => i.period_usage?.accepted ?? 0 },
    { header: 'DESCARTADOS', accessor: (i) => i.period_usage?.discarded ?? 0 },
    { header: 'USUARIOS', accessor: (i) => i.period_usage?.distinct_users ?? 0 },
    { header: 'ÚLTIMO USO', accessor: (i) => formatDateTime(i.period_usage?.last_used_at) },
    { header: 'NOTAS', accessor: (i) => i.notes ?? '' },
  ])
}
