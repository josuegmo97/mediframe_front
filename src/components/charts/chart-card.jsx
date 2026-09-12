import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'

/**
 * Contenedor de gráfico con estados de carga/vacío y vista de tabla equivalente (accesibilidad).
 * `table`: { columns: [{ key, header, align }], rows: [{...}] }
 */
export function ChartCard({ title, description, loading = false, empty = false, emptyTitle = 'Sin datos todavía', emptyDescription, height = 260, table, legend, children, className }) {
  const [showTable, setShowTable] = useState(false)
  const canToggle = Boolean(table && !loading && !empty)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {canToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
            aria-label={showTable ? 'Ver gráfico' : 'Ver como tabla'}
            className="-mr-2 -mt-1 shrink-0 text-fg-muted"
          >
            {showTable ? <BarChart3 /> : <Table2 />}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-col justify-end gap-2" style={{ height }}>
            <Skeleton className="h-[70%] w-full rounded-lg" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : empty ? (
          <EmptyState compact icon={BarChart3} title={emptyTitle} description={emptyDescription} className="flex-1" />
        ) : showTable ? (
          <div className="overflow-x-auto scrollbar-thin" style={{ minHeight: height }}>
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
                <tr>
                  {table.columns.map((col) => (
                    <th key={col.key} scope="col" className={cn('px-2 py-2', col.align === 'right' && 'text-right')}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {table.rows.map((row, index) => (
                  <tr key={row.key ?? index}>
                    {table.columns.map((col) => (
                      <td key={col.key} className={cn('px-2 py-2', col.align === 'right' && 'text-right tabular-nums')}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div style={{ height }} className="w-full min-w-0">
              {children}
            </div>
            {legend && <div className="mt-3">{legend}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Leyenda simple: [{ label, color, value }] */
export function ChartLegend({ items, className }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-fg-muted', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} aria-hidden="true" />
          <span>{item.label}</span>
          {item.value != null && <span className="font-medium tabular-nums text-fg">{item.value}</span>}
        </li>
      ))}
    </ul>
  )
}
