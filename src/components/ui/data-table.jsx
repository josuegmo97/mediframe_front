import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/use-media-query'
import { Skeleton } from './skeleton'

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' }
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

function SkeletonRows({ columns, count }) {
  return Array.from({ length: count }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {columns.map((col) => (
        <td key={col.key} className={cn('px-4 py-3', col.hideBelow && HIDE[col.hideBelow])}>
          <Skeleton className={cn('h-4', rowIndex % 2 ? 'w-2/3' : 'w-4/5')} />
        </td>
      ))}
    </tr>
  ))
}

function SkeletonCards({ count }) {
  return Array.from({ length: count }).map((_, index) => (
    <li key={index} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </li>
  ))
}

/**
 * Tabla responsive: `<table>` desde md; en móvil, lista de cards via `renderCard(row)`.
 *
 * columns: [{ key, header, cell(row), align, width, hideBelow: 'sm'|'md'|'lg'|'xl', className, headerClassName }]
 */
export function DataTable({
  columns,
  rows,
  rowKey = (row) => row._id,
  loading = false,
  skeletonRows = 6,
  emptyState = null,
  renderCard,
  onRowClick,
  rowClassName,
  caption,
  className,
  dense = false,
}) {
  const isMobile = useIsMobile()
  const useCards = isMobile && typeof renderCard === 'function'

  if (!loading && rows.length === 0) {
    return emptyState
  }

  if (useCards) {
    return (
      <ul className={cn('space-y-3', className)} aria-busy={loading || undefined}>
        {loading ? (
          <SkeletonCards count={Math.min(skeletonRows, 4)} />
        ) : (
          rows.map((row) => (
            <li key={rowKey(row)}>{renderCard(row)}</li>
          ))
        )}
      </ul>
    )
  }

  const interactive = typeof onRowClick === 'function'
  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3'

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border bg-surface shadow-card dark:shadow-none scrollbar-thin', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm" aria-busy={loading || undefined}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(cellPadding, 'whitespace-nowrap', ALIGN[col.align ?? 'left'], col.hideBelow && HIDE[col.hideBelow], col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <SkeletonRows columns={columns} count={skeletonRows} />
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                tabIndex={interactive ? 0 : undefined}
                onClick={interactive ? () => onRowClick(row) : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.target !== event.currentTarget) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                className={cn(
                  'transition-colors',
                  interactive && 'cursor-pointer hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none',
                  typeof rowClassName === 'function' ? rowClassName(row) : rowClassName
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(cellPadding, 'align-middle', ALIGN[col.align ?? 'left'], col.hideBelow && HIDE[col.hideBelow], col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
