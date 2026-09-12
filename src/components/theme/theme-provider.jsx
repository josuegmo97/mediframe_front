import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/storage'

const ThemeContext = createContext(null)
const THEMES = ['light', 'dark', 'system']
const MEDIA = '(prefers-color-scheme: dark)'

function readStored() {
  const value = storageGet(STORAGE_KEYS.theme)
  return THEMES.includes(value) ? value : 'system'
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.(MEDIA).matches
}

function applyClass(dark) {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStored)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const mql = window.matchMedia?.(MEDIA)
    if (!mql) return undefined
    const onChange = (event) => setSystemDark(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    applyClass(resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    storageSet(STORAGE_KEYS.theme, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme }), [theme, resolvedTheme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
