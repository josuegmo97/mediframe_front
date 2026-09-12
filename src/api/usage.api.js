import { http, unwrap } from './http'

/** @returns {Promise<{items: object[], stats: {total:number, withLicense:number, withoutLicense:number, totals: object}}>} */
export function listUsage() {
  return http.get('/usage').then(unwrap)
}

export function getUsageByDevice(deviceId) {
  return http.get(`/usage/${encodeURIComponent(deviceId)}`).then(unwrap)
}
