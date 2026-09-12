import { formatNumber } from '@/lib/format'

/** Tooltip de recharts con los tokens del design system. */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatNumber }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[8rem] rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-pop">
      {label != null && <p className="mb-1 font-semibold text-fg">{labelFormatter ? labelFormatter(label, payload) : label}</p>}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-fg-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.fill }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums text-fg">{valueFormatter(entry.value, entry)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
