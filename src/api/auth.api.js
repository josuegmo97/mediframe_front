import { http, unwrap } from './http'

/** @returns {Promise<{user: object, token: string, expiresIn: string}>} */
export function login({ username, password }) {
  return http.post('/auth/login', { username, password }, { skipAuthHandling: true }).then(unwrap)
}

/** Crea un usuario inactivo (status 0, rol espectador). `email` se omite si viene vacío. */
export function register({ username, fullname, email, password }) {
  const payload = { username, fullname, password }
  if (email) payload.email = email
  return http.post('/auth/register', payload, { skipAuthHandling: true }).then(unwrap)
}

/** @returns {Promise<{valid: boolean, user: object}>} */
export function verify() {
  return http.get('/auth/verify').then(unwrap)
}
