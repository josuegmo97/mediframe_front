import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PAGE_SIZES } from '@/lib/constants'
import { formatNumber } from '@/lib/format'
import { Button } from './button'
import { Select } from './select'

function pageWindow(page, totalPages, max = 5) {
  if (totalPages <= max + 2) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const half = Math.floor(max / 2)
  let start = Math.max(2, page - half)
  let end = Math.min(totalPages - 1, start + max - 1)
  start = Math.max(2, end - max + 1)
  const pages = [1]
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < totalPages - 1) pages.push('…')
  pages.push(totalPages)
  return pages
}

export function Pagination({ page, pageSize, total, totalPages, from, to, onPageChange, onPageSizeChange, pageSizeOptions = PAGE_SIZES, itemLabel = 'resultados', className }) {
  if (total === 0) return null
  const pages = pageWindow(page, totalPages)

  return (
    <nav className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)} aria-label="Paginación">
      <p className="text-sm text-fg-muted">
        Mostrando <span className="font-medium tabular-nums text-fg">{formatNumber(from)}–{formatNumber(to)}</span> de{' '}
        <span className="font-medium tabular-nums text-fg">{formatNumber(total)}</span> {itemLabel}
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="hidden sm:inline">Por página</span>
            <Select
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
              className="h-9 w-[4.5rem] md:h-9"
              aria-label="Resultados por página"
            />
          </label>
        )}

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
            <ChevronLeft />
          </Button>

          <span className="px-2 text-sm tabular-nums text-fg-muted sm:hidden">
            {page} / {totalPages}
          </span>

          <div className="hidden items-center gap-1 sm:flex">
            {pages.map((item, index) =>
              item === '…' ? (
                <span key={`gap-${index}`} className="px-1 text-fg-subtle" aria-hidden="true">
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'primary' : 'ghost'}
                  size="icon-sm"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Página ${item}`}
                  className="tabular-nums"
                >
                  {item}
                </Button>
              )
            )}
          </div>

          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </nav>
  )
}
