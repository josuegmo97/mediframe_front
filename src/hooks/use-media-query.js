import { useCallback, useSyncExternalStore } from 'react'

function getMatch(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(subscribe, () => getMatch(query), () => false)
}

/** < md (768px): navegación en drawer, tablas como cards. */
export function useIsMobile() {
  return !useMediaQuery('(min-width: 768px)')
}

/** ≥ lg (1024px): sidebar fija. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsTouch() {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}
