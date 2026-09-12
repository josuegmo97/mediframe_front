import { CONTACT_STATUS_META } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { formatDateTime } from '@/lib/format'

const normalize = (value) => String(value ?? '').toLowerCase()

export function filterContacts(contacts, { q = '', estado = '' } = {}) {
  const query = normalize(q).trim()
  return (contacts ?? []).filter((contact) => {
    if (estado !== '' && String(contact.status) !== String(estado)) return false
    if (!query) return true
    return (
      normalize(contact.name).includes(query) ||
      normalize(contact.email).includes(query) ||
      normalize(contact.institution).includes(query) ||
      normalize(contact.specialty).includes(query) ||
      normalize(contact.phone).includes(query) ||
      normalize(contact.interest).includes(query)
    )
  })
}

export function countContacts(contacts) {
  const pending = (contacts ?? []).filter((c) => Number(c.status) === 0).length
  return { total: contacts?.length ?? 0, pending, contacted: (contacts?.length ?? 0) - pending }
}

export function contactsToCsv(contacts) {
  return toCsv(contacts, [
    { header: 'FECHA', accessor: (c) => formatDateTime(c.created_at) },
    { header: 'NOMBRE', accessor: 'name' },
    { header: 'ESPECIALIDAD', accessor: 'specialty' },
    { header: 'INSTITUCIÓN', accessor: 'institution' },
    { header: 'CORREO', accessor: 'email' },
    { header: 'TELÉFONO', accessor: 'phone' },
    { header: 'INTERÉS', accessor: 'interest' },
    { header: 'ESTADO', accessor: (c) => CONTACT_STATUS_META[c.status]?.label ?? c.status },
  ])
}
