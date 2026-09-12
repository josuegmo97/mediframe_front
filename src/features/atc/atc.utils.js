import { ATC_STATUS_META } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { normalizeDeviceId } from '@/lib/device-description'
import { formatDateTime } from '@/lib/format'

const normalize = (value) => String(value ?? '').toLowerCase()

/** Filtro en cliente. estado: '' | '0' | '1'. dispositivo: texto (se normaliza como el backend). */
export function filterAtc(messages, { q = '', dispositivo = '', version = '', estado = '' } = {}) {
  const query = normalize(q).trim()
  const device = normalizeDeviceId(dispositivo)
  return (messages ?? []).filter((message) => {
    if (estado !== '' && String(message.status) !== String(estado)) return false
    if (version !== '' && String(message.version) !== version) return false
    if (device && !normalizeDeviceId(message.device).includes(device)) return false
    if (!query) return true
    return normalize(message.message).includes(query) || normalize(message.device).includes(query) || normalize(message.version).includes(query)
  })
}

export function distinctAtcVersions(messages) {
  return [...new Set((messages ?? []).map((m) => String(m.version ?? '').trim()).filter(Boolean))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

export function countPending(messages) {
  return (messages ?? []).filter((m) => Number(m.status) === 0).length
}

export function atcToCsv(messages) {
  return toCsv(messages, [
    { header: 'FECHA', accessor: (m) => formatDateTime(m.created_at) },
    { header: 'DISPOSITIVO', accessor: 'device' },
    { header: 'VERSIÓN', accessor: 'version' },
    { header: 'ESTADO', accessor: (m) => ATC_STATUS_META[m.status]?.label ?? m.status },
    { header: 'MENSAJE', accessor: 'message' },
  ])
}
