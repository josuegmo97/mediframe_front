import { cn } from '@/lib/cn'
import { quotaLabel, quotaPercent } from '../voice-reports.utils'

/** Barra de consumo de cuota. Sin límite → solo el contador. */
export function QuotaBar({ quota, className, showLabel = true }) {
  const percent = quotaPercent(quota)
  const tone = percent == null ? 'bg-info' : percent >= 100 ? 'bg-danger' : percent >= 80 ? 'bg-warning' : 'bg-success'
  return (
    <div className={cn('min-w-0', className)}>
      {showLabel && <p className="text-sm tabular-nums text-fg">{quotaLabel(quota)}</p>}
      {percent != null && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Cuota consumida">
          <div className={cn('h-full rounded-full transition-[width]', tone)} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}
