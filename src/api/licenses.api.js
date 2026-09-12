import { http, unwrap } from './http'

/** @returns {Promise<{licenses: object[], stats: object}>} Ejecuta además el barrido de expiración en el backend. */
export function listLicenses() {
  return http.get('/licenses').then(unwrap)
}

/** @returns {Promise<{stats: object, expiringLicenses: object[]}>} */
export function getLicenseStats() {
  return http.get('/licenses/stats').then(unwrap)
}

export function getLicense(id) {
  return http.get(`/licenses/${id}`).then(unwrap)
}

export function createLicense({ days_permission, description }) {
  const body = { days_permission: Number(days_permission) }
  if (description) body.description = description
  return http.post('/licenses', body).then(unwrap)
}

/** @returns {Promise<{created: number, licenses: {code: string, days_permission: number}[], errors?: string[]}>} */
export function createLicenseBatch({ quantity, days_permission, description }) {
  const body = { quantity: Number(quantity), days_permission: Number(days_permission) }
  if (description) body.description = description
  return http.post('/licenses/batch', body).then(unwrap)
}

export function deleteLicense(id) {
  return http.delete(`/licenses/${id}`).then(unwrap)
}
