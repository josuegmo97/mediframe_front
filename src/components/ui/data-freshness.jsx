import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'
import { Button } from './button'
import { Tooltip } from './tooltip'

/**
 * "Actualizado hace X" + botón de refresco con enfriamiento, para recursos con rate limit.
 */
export function DataFreshness({ updatedAt, onRefresh, isFetching = false, cooldownMs = 60_000, className }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const cooling = Boolean(updatedAt) && now - updatedAt < cooldownMs
  const label = isFetching ? 'Actualizando…' : updatedAt ? `Actualizado ${formatRelative(updatedAt)}` : null

  return (
    <div className={cn('flex items-center gap-1 text-xs text-fg-muted', className)}>
      {label && <span aria-live="polite">{label}</span>}
      <Tooltip content={cooling ? 'Espera un momento antes de volver a actualizar' : 'Actualizar datos'}>
        <Button variant="ghost" size="icon-sm" onClick={onRefresh} disabled={isFetching || cooling} aria-label="Actualizar datos">
          <RefreshCw className={cn(isFetching && 'animate-spin')} />
        </Button>
      </Tooltip>
    </div>
  )
}
