import { toCsv } from '@/lib/csv'
import { deviceLabel } from '@/lib/device-description'
import { formatDateTime, shortId } from '@/lib/format'
import { licenseCodeMatches } from '@/lib/license-code'

const normalize = (value) => String(value ?? '').toLowerCase()

/** Filtro en cliente. licencia: '' | 'con' | 'sin'; version: '' | texto exacto. */
export function filterUsage(items, { q = '', licencia = '', version = '' } = {}) {
  const query = normalize(q).trim()
  return (items ?? []).filter((item) => {
    if (licencia === 'con' && !item.license) return false
    if (licencia === 'sin' && item.license) return false
    if (version !== '' && String(item.version) !== version) return false
    if (!query) return true
    const license = item.license ?? {}
    return (
      normalize(item.device_id).includes(query) ||
      normalize(item.version).includes(query) ||
      licenseCodeMatches(license.code, query) ||
      normalize(license.owner_name).includes(query) ||
      normalize(license.owner_email).includes(query) ||
      normalize(license.owner_identification).includes(query) ||
      normalize(deviceLabel(license.device_description, '')).includes(query)
    )
  })
}

export function distinctVersions(items) {
  return [...new Set((items ?? []).map((item) => String(item.version ?? '').trim()).filter(Boolean))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

/** Etiqueta legible de la instalación: modelo · equipo, o el id acortado. */
export function installationLabel(item) {
  return deviceLabel(item?.license?.device_description, null) ?? shortId(item?.device_id, 13)
}

export function usageToCsv(items) {
  return toCsv(items, [
    { header: 'DISPOSITIVO', accessor: 'device_id' },
    { header: 'EQUIPO', accessor: (i) => deviceLabel(i.license?.device_description, '') },
    { header: 'VERSIÓN APP', accessor: 'version' },
    { header: 'LICENCIA', accessor: (i) => i.license?.code ?? '' },
    { header: 'PROPIETARIO', accessor: (i) => i.license?.owner_name ?? '' },
    { header: 'CORREO', accessor: (i) => i.license?.owner_email ?? '' },
    { header: 'PACIENTES', accessor: 'patients' },
    { header: 'HISTORIAS', accessor: 'histories' },
    { header: 'USUARIOS', accessor: 'users' },
    { header: 'PDF', accessor: 'pdf' },
    { header: 'ÚLTIMO EVENTO', accessor: 'trigger' },
    { header: 'ÚLTIMA SINCRONIZACIÓN', accessor: (i) => formatDateTime(i.received_at) },
    { header: 'PRIMERA SINCRONIZACIÓN', accessor: (i) => formatDateTime(i.created_at) },
  ])
}
