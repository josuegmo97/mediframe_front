/**
 * Acceso seguro a localStorage: nunca lanza (modo privado, storage bloqueado, SSR).
 */
function getStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

export function storageGet(key) {
  try {
    return getStorage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function storageSet(key, value) {
  try {
    getStorage()?.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function storageRemove(key) {
  try {
    getStorage()?.removeItem(key)
    return true
  } catch {
    return false
  }
}
