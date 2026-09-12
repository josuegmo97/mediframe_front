import { useEffect, useMemo } from 'react'

/**
 * Paginación en cliente con página controlada (normalmente sincronizada en la URL).
 * Si la página queda fuera de rango tras filtrar, se corrige automáticamente.
 */
export function usePagination({ items, page, pageSize, onPageChange }) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    if (safePage !== page) onPageChange(safePage)
  }, [safePage, page, onPageChange])

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    from: total === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, total),
    pageItems,
  }
}
