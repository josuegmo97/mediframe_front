import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Filtros de listado sincronizados con la URL.
 *
 * @param {Record<string, string>} defaults  claves y valores por defecto (los valores por defecto no se escriben en la URL)
 * @returns {{ filters: Record<string,string>, setFilter: (key, value) => void, setFilters: (patch) => void, reset: () => void, isDirty: boolean }}
 */
export function useListFilters(defaults) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const result = {}
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key)
      result[key] = value == null || value === '' ? defaults[key] : value
    }
    return result
  }, [searchParams, defaults])

  const setFilters = useCallback(
    (patch) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const touchesFilter = Object.keys(patch).some((key) => key !== 'pagina')
          for (const [key, value] of Object.entries(patch)) {
            if (value == null || value === '' || String(value) === String(defaults[key])) next.delete(key)
            else next.set(key, String(value))
          }
          // Cambiar un filtro vuelve a la primera página
          if (touchesFilter && !('pagina' in patch)) next.delete('pagina')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams, defaults]
  )

  const setFilter = useCallback((key, value) => setFilters({ [key]: value }), [setFilters])

  const reset = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const key of Object.keys(defaults)) next.delete(key)
        next.delete('pagina')
        return next
      },
      { replace: true }
    )
  }, [setSearchParams, defaults])

  const isDirty = Object.keys(defaults).some((key) => key !== 'pagina' && filters[key] !== defaults[key])

  return { filters, setFilter, setFilters, reset, isDirty }
}
