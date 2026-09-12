import axios from 'axios'
import { API_URL } from '@/api/http'
import { normalizeApiError } from '@/lib/api-error'
import { STORAGE_KEYS } from '@/lib/constants'
import { getTokenRemainingMs, isTokenExpired } from '@/lib/jwt'
import { authStore } from './auth-store'

/**
 * Renueva el JWT (15 min) antes de que expire, solo con la pestaña visible.
 *
 * Reglas por el rate limiter de /api/auth (5 respuestas no-2xx / 15 min / IP):
 *  - nunca se llama a /auth/refresh con un token vencido;
 *  - un 401/403 en refresh cierra la sesión sin reintentar;
 *  - un 429 activa un cooldown y se deja expirar el token de forma natural;
 *  - errores de red/5xx: un único reintento a los 10 s.
 */
const LEAD_MS = 60_000
const MIN_DELAY_MS = 5_000
const RETRY_MS = 10_000
const COOLDOWN_MS = 15 * 60_000

let timer = null
let inflight = null
let cooldownUntil = 0
let retried = false
let started = false

// Instancia sin interceptores: un fallo aquí no debe disparar el manejo global de 401.
const bare = axios.create({ baseURL: API_URL, timeout: 15_000, headers: { Accept: 'application/json' } })

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function expireNow() {
  clearTimer()
  authStore.clearSession('expired')
}

function schedule() {
  clearTimer()
  if (!started) return
  const { status, token } = authStore.getSnapshot()
  if (status !== 'authenticated' || !token) return
  if (typeof document !== 'undefined' && document.hidden) return

  const remaining = getTokenRemainingMs(token)
  if (remaining <= MIN_DELAY_MS) return expireNow()
  if (remaining <= LEAD_MS) return void refreshNow()
  timer = setTimeout(refreshNow, remaining - LEAD_MS)
}

function refreshNow() {
  if (inflight) return inflight

  const { status, token } = authStore.getSnapshot()
  if (status !== 'authenticated' || !token) return Promise.resolve(null)
  if (isTokenExpired(token)) {
    expireNow()
    return Promise.resolve(null)
  }

  if (Date.now() < cooldownUntil) {
    clearTimer()
    timer = setTimeout(expireNow, Math.max(getTokenRemainingMs(token) - 1_000, 0))
    return Promise.resolve(null)
  }

  inflight = bare
    .post('/auth/refresh', null, { headers: { Authorization: `Bearer ${token}` } })
    .then((response) => {
      const nextToken = response?.data?.data?.token
      if (!nextToken) throw new Error('Respuesta de refresh sin token')
      authStore.setToken(nextToken)
      retried = false
      schedule()
      return nextToken
    })
    .catch((error) => {
      const normalized = normalizeApiError(error)
      if (normalized.status === 401 || normalized.status === 403) {
        authStore.clearSession(normalized.status === 403 ? 'inactive' : 'expired')
      } else if (normalized.status === 429) {
        cooldownUntil = Date.now() + COOLDOWN_MS
        schedule()
      } else if (!retried) {
        retried = true
        clearTimer()
        timer = setTimeout(refreshNow, RETRY_MS)
      } else {
        clearTimer()
        timer = setTimeout(expireNow, Math.max(getTokenRemainingMs(authStore.getSnapshot().token), 0))
      }
      return null
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

function onVisibilityChange() {
  if (document.hidden) clearTimer()
  else schedule()
}

function onStorage(event) {
  if (event.key !== STORAGE_KEYS.token) return
  const current = authStore.getSnapshot()
  if (!event.newValue) {
    if (current.status === 'authenticated') authStore.clearSession('user')
    return
  }
  if (event.newValue !== current.token && current.status === 'authenticated') {
    authStore.setToken(event.newValue)
    schedule()
  }
}

export const sessionManager = {
  start() {
    if (started) return
    started = true
    retried = false
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('storage', onStorage)
    schedule()
  },
  stop() {
    started = false
    clearTimer()
    inflight = null
    retried = false
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('storage', onStorage)
  },
  schedule,
  refreshNow,
}
