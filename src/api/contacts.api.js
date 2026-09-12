import { http, unwrap } from './http'

/** @returns {Promise<{contacts: object[], total: number}>} */
export function listContacts() {
  return http.get('/contacts').then(unwrap)
}

export function getContact(id) {
  return http.get(`/contacts/${id}`).then(unwrap)
}

/** status: 0 pendiente | 1 contactado (número JSON). */
export function updateContactStatus(id, status) {
  return http.patch(`/contacts/${id}`, { status: Number(status) }).then(unwrap)
}
