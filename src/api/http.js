import axios from 'axios'
import { authStore } from '@/features/auth/auth-store'
import { ApiError, MESSAGES_BY_CODE, normalizeApiError } from '@/lib/api-error'
import { isTokenExpired } from '@/lib/jwt'

export const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

/** Rutas que no llevan token (y cuyos 401 no deben cerrar la sesión). */
const PUBLIC_PATHS = ['/auth/login', '/auth/register']

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((path) => String(config.url || '').startsWith(path))
  if (isPublic) return config

  const { token } = authStore.getSnapshot()
  if (!token) return config

  // Nunca se envía una petición con un token ya vencido: evita 401 innecesarios
  // (que además consumen el rate limiter de /api/auth cuando aplica).
  if (isTokenExpired(token)) {
    authStore.clearSession('expired')
    return Promise.reject(
      new ApiError({ status: 401, code: 'SESSION_EXPIRED', message: MESSAGES_BY_CODE.SESSION_EXPIRED, flags: { handled: true } })
    )
  }

  config.headers = config.headers ?? {}
  config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error)
    const skip = Boolean(error?.config?.skipAuthHandling)

    if (!skip && authStore.getSnapshot().status === 'authenticated') {
      if (normalized.status === 401) {
        authStore.clearSession('expired')
        normalized.handled = true
      } else if (normalized.status === 403 && ['AUTH_003', 'AUTH_009'].includes(normalized.code)) {
        authStore.clearSession('inactive')
        normalized.handled = true
      }
    }

    return Promise.reject(normalized)
  }
)

/** Devuelve `data` del envelope `{ success, data, message }`. */
export const unwrap = (response) => response?.data?.data
