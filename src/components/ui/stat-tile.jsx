import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { Skeleton } from './skeleton'

const TONES = {
  neutral: 'bg-surface-2 text-fg-muted',
  accent: 'bg-accent/20 text-fg',
  success: 'bg-success/15 text-success-fg dark:text-success',
  info: 'bg-info/15 text-info-fg dark:text-info',
  warning: 'bg-warning/15 text-warning-fg dark:text-warning',
  danger: 'bg-danger/15 text-danger-text',
}

/** Tile de métrica. Interactivo cuando recibe `to` (Link) u `onClick` (botón). */
export function StatTile({ label, value, icon: Icon, tone = 'accent', hint, loading = false, to, onClick, active = false, className, format = true }) {
  const interactive = Boolean(to || onClick)
  const Comp = to ? Link : onClick ? 'button' : 'div'
  const display = loading ? null : typeof value === 'number' && format ? formatNumber(value) : value ?? '—'

  return (
    <Comp
      to={to}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-xl border bg-surface p-4 text-left shadow-card transition-colors dark:shadow-none sm:gap-4 sm:p-5',
        active ? 'border-primary ring-1 ring-primary/40' : 'border-border',
        interactive && 'cursor-pointer hover:border-border-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className
      )}
    >
      {Icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11', TONES[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</span>
        {loading ? (
          <Skeleton className="mt-1.5 h-7 w-16" />
        ) : (
          <span className="block truncate text-2xl font-semibold leading-tight tabular-nums text-fg sm:text-[1.75rem]">{display}</span>
        )}
        {hint && !loading && <span className="mt-0.5 block truncate text-xs text-fg-subtle">{hint}</span>}
      </span>
    </Comp>
  )
}
