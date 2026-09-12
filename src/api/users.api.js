import { http, unwrap } from './http'

const withNumbers = (payload) => {
  const body = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    body[key] = key === 'status' || key === 'role' ? Number(value) : value
  }
  return body
}

/** @returns {Promise<{users: object[], total: number}>} */
export function listUsers() {
  return http.get('/users').then(unwrap)
}

/** @returns {Promise<{stats: {total:number, active:number, inactive:number, admins:number, spectators:number}}>} */
export function getUserStats() {
  return http.get('/users/stats').then(unwrap)
}

export function getUser(id) {
  return http.get(`/users/${id}`).then(unwrap)
}

/** `status`/`role` se envían siempre como números (el backend rechaza strings). */
export function updateUser(id, payload) {
  return http.put(`/users/${id}`, withNumbers(payload)).then(unwrap)
}

export function getProfile() {
  return http.get('/users/profile').then(unwrap)
}

/** Solo fullname, email y password son editables por el propio usuario. */
export function updateProfile(payload) {
  const body = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) body[key] = value
  }
  return http.put('/users/profile', body).then(unwrap)
}
