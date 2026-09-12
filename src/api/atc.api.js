import { http, unwrap } from './http'

/** @returns {Promise<{messages: object[], total: number}>} */
export function listAtcMessages() {
  return http.get('/atc').then(unwrap)
}

export function getAtcMessage(id) {
  return http.get(`/atc/${id}`).then(unwrap)
}

/** status: 0 pendiente | 1 atendido (número JSON). */
export function updateAtcStatus(id, status) {
  return http.patch(`/atc/${id}`, { status: Number(status) }).then(unwrap)
}
