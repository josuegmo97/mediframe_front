import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth.api'
import { normalizeApiError } from '@/lib/api-error'
import { isTokenExpired } from '@/lib/jwt'
import { toast } from '@/lib/toast'
import { authStore, isAdminUser } from './auth-store'
import { sessionManager } from './session-manager'

const AuthContext = createContext(null)

const END_MESSAGES = {
  expired: { type: 'info', text: 'Tu sesión expiró. Inicia sesión de nuevo.' },
  invalid: { type: 'info', text: 'Tu sesión ya no es válida. Inicia sesión de nuevo.' },
  inactive: { type: 'warning', text: 'Tu cuenta está inactiva. Contacta a un administrador.' },
}

export function AuthProvider({ children }) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot)
  const queryClient = useQueryClient()
  const bootedRef = useRef(false)

  /**
   * Arranque: sin token → anónimo; token vencido → se descarta SIN llamar a la red
   * (un 401 en /auth/verify consumiría el limiter de auth); token válido → /auth/verify.
   */
  const boot = useCallback(async () => {
    const { token } = authStore.getSnapshot()
    if (!token) return authStore.setAnonymous()
    if (isTokenExpired(token)) return authStore.clearSession('expired')

    try {
      const { user } = await authApi.verify()
      authStore.setSession({ token: authStore.getSnapshot().token ?? token, user })
      sessionManager.start()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (normalized.handled) return
      if (normalized.status === 401) return authStore.clearSession('invalid')
      if (normalized.status === 403) return authStore.clearSession('inactive')
      // 429, red o 5xx: no se descarta un token válido; se ofrece reintentar
      authStore.setBootError(normalized)
    }
  }, [])

  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    boot()
  }, [boot])

  // Fin de sesión (desde interceptores, refresh o logout): limpiar cache y avisar
  useEffect(() => {
    if (state.status !== 'anonymous' || !state.endReason) return
    const reason = authStore.consumeEndReason()
    sessionManager.stop()
    queryClient.clear()
    const message = END_MESSAGES[reason]
    if (message) toast[message.type](message.text, { id: 'session-end' })
  }, [state.status, state.endReason, queryClient])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    authStore.setSession({ token: data.token, user: data.user })
    sessionManager.start()
    return data.user
  }, [])

  const register = useCallback((payload) => authApi.register(payload), [])

  const logout = useCallback(() => {
    sessionManager.stop()
    authStore.clearSession('user')
    queryClient.clear()
    toast.success('Sesión cerrada', { id: 'session-end' })
  }, [queryClient])

  const refreshUser = useCallback(async () => {
    const { user } = await authApi.verify()
    authStore.setUser(user)
    return user
  }, [])

  const setUser = useCallback((user) => authStore.setUser(user), [])

  const value = useMemo(() => {
    const isAuthenticated = state.status === 'authenticated'
    const isAdmin = isAuthenticated && isAdminUser(state.user)
    return {
      status: state.status,
      user: state.user,
      token: state.token,
      bootError: state.bootError,
      isAuthenticated,
      isAdmin,
      isViewer: isAuthenticated && !isAdmin,
      login,
      register,
      logout,
      refreshUser,
      setUser,
      retryBoot: boot,
    }
  }, [state, login, register, logout, refreshUser, setUser, boot])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
