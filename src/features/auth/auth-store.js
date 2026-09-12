import { STORAGE_KEYS, ROLE, USER_STATUS } from '@/lib/constants'
import { storageGet, storageRemove, storageSet } from '@/lib/storage'

/**
 * Store externo de sesión (fuera de React) para que interceptores y el
 * programador de refresh puedan leer/escribir sin hooks.
 *
 * status: 'booting' | 'authenticated' | 'anonymous'
 * endReason: null | 'expired' | 'inactive' | 'user' | 'invalid'
 */
const listeners = new Set()

let state = {
  status: 'booting',
  token: storageGet(STORAGE_KEYS.token),
  user: null,
  endReason: null,
  bootError: null,
}

function emit() {
  for (const listener of listeners) listener(state)
}

function setState(patch) {
  state = { ...state, ...patch }
  emit()
}

export const authStore = {
  getSnapshot() {
    return state
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setSession({ token, user }) {
    storageSet(STORAGE_KEYS.token, token)
    setState({ status: 'authenticated', token, user, endReason: null, bootError: null })
  },
  setToken(token) {
    storageSet(STORAGE_KEYS.token, token)
    setState({ token })
  },
  setUser(user) {
    setState({ user })
  },
  setAnonymous() {
    storageRemove(STORAGE_KEYS.token)
    setState({ status: 'anonymous', token: null, user: null, bootError: null })
  },
  clearSession(reason = 'user') {
    storageRemove(STORAGE_KEYS.token)
    setState({ status: 'anonymous', token: null, user: null, endReason: reason, bootError: null })
  },
  setBootError(error) {
    setState({ status: 'booting', bootError: error })
  },
  consumeEndReason() {
    const reason = state.endReason
    if (reason) setState({ endReason: null })
    return reason
  },
}

export const isAdminUser = (user) => Boolean(user) && Number(user.role) === ROLE.ADMIN && Number(user.status) === USER_STATUS.ACTIVE
