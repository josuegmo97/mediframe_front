import { ROLE, ROLE_LABEL, USER_STATUS, USER_STATUS_LABEL } from '@/lib/constants'
import { toCsv } from '@/lib/csv'
import { formatDateTime } from '@/lib/format'

const normalize = (value) => String(value ?? '').toLowerCase()

/** Filtro en cliente: texto libre (usuario/nombre/correo), estado ('' | '0' | '1'), rol ('' | '1' | '2'). */
export function filterUsers(users, { q = '', estado = '', rol = '' } = {}) {
  const query = normalize(q).trim()
  return (users ?? []).filter((user) => {
    if (estado !== '' && String(user.status) !== String(estado)) return false
    if (rol !== '' && String(user.role) !== String(rol)) return false
    if (!query) return true
    return normalize(user.username).includes(query) || normalize(user.fullname).includes(query) || normalize(user.email).includes(query)
  })
}

export function usersToCsv(users) {
  return toCsv(users, [
    { header: 'USUARIO', accessor: 'username' },
    { header: 'NOMBRE COMPLETO', accessor: 'fullname' },
    { header: 'CORREO', accessor: (u) => u.email ?? '' },
    { header: 'ROL', accessor: (u) => ROLE_LABEL[u.role] ?? u.role },
    { header: 'ESTADO', accessor: (u) => USER_STATUS_LABEL[u.status] ?? u.status },
    { header: 'REGISTRO', accessor: (u) => formatDateTime(u.created_at) },
    { header: 'ACTUALIZADO', accessor: (u) => formatDateTime(u.updated_at) },
  ])
}

export const isActiveAdmin = (user) => Number(user?.role) === ROLE.ADMIN && Number(user?.status) === USER_STATUS.ACTIVE

/** True si `user` es el único administrador activo del sistema. */
export function isLastActiveAdmin(users, user) {
  if (!isActiveAdmin(user)) return false
  return (users ?? []).filter(isActiveAdmin).length <= 1
}

/** Devuelve solo los campos que cambiaron (email vacío no se envía: la API no permite borrarlo). */
export function diffUser(original, values) {
  const payload = {}
  const fullname = values.fullname?.trim()
  if (fullname && fullname !== original.fullname) payload.fullname = fullname
  const email = values.email?.trim()
  if (email && email !== (original.email ?? '')) payload.email = email
  if (values.password) payload.password = values.password
  if (values.role != null && Number(values.role) !== Number(original.role)) payload.role = Number(values.role)
  if (values.status != null && Number(values.status) !== Number(original.status)) payload.status = Number(values.status)
  return payload
}

export function findDuplicate(users, { username, email }, excludeId = null) {
  const u = normalize(username).trim()
  const e = normalize(email).trim()
  for (const user of users ?? []) {
    if (user._id === excludeId) continue
    if (u && normalize(user.username) === u) return { field: 'username', message: 'Ese nombre de usuario ya está en uso.' }
    if (e && normalize(user.email) === e) return { field: 'email', message: 'Ese correo ya está en uso.' }
  }
  return null
}

const PASSWORD_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generatePassword(length = 12) {
  const values = new Uint32Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(values)
  else for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 2 ** 32)
  return Array.from(values, (v) => PASSWORD_CHARS[v % PASSWORD_CHARS.length]).join('')
}
