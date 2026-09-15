import { http, unwrap } from './http'

const BASE = '/voice-reports/admin'

/** @returns {Promise<{settings: object}>} */
export function getVoiceReportSettings() {
  return http.get(`${BASE}/settings`).then(unwrap)
}

/** Campos opcionales: enabled, default_limit (int|null), period, max_duration_seconds, max_audio_bytes, default_device_enabled. */
export function updateVoiceReportSettings(patch) {
  return http.patch(`${BASE}/settings`, patch).then(unwrap)
}

/** @returns {Promise<{settings: object, period: object, items: object[], stats: object}>} */
export function listVoiceReportDevices() {
  return http.get(`${BASE}/devices`).then(unwrap)
}

/** @returns {Promise<{item: object}>} */
export function getVoiceReportDevice(deviceId) {
  return http.get(`${BASE}/devices/${encodeURIComponent(deviceId)}`).then(unwrap)
}

/** Campos opcionales: enabled, blocked_by_admin, limit_override (int|null), notes (string|null). */
export function updateVoiceReportDevice(deviceId, patch) {
  return http.patch(`${BASE}/devices/${encodeURIComponent(deviceId)}`, patch).then(unwrap)
}

/** @returns {Promise<{device_id: string, items: object[], pagination: object}>} */
export function getVoiceReportDeviceUsage(deviceId, params = {}) {
  return http.get(`${BASE}/devices/${encodeURIComponent(deviceId)}/usage`, { params }).then(unwrap)
}
