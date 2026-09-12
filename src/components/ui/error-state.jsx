import { Clock, LockKeyhole, RefreshCw, SearchX, WifiOff, XCircle } from 'lucide-react'
import { normalizeApiError } from '@/lib/api-error'
import { RATE_LIMIT_WINDOW_MINUTES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { Button } from './button'

function describe(error) {
  if (error.isRateLimited) {
    return {
      Icon: Clock,
      title: 'Demasiadas solicitudes',
      description: `La API limita las consultas por ventana de ${RATE_LIMIT_WINDOW_MINUTES} minutos. Espera unos minutos e inténtalo de nuevo.`,
    }
  }
  if (error.isForbidden) {
    return { Icon: LockKeyhole, title: 'Sin permisos', description: 'Tu cuenta no tiene acceso a esta información. Si crees que es un error, actualiza tu sesión.' }
  }
  if (error.isNotFound) {
    return { Icon: SearchX, title: 'No encontrado', description: error.message }
  }
  if (error.isNetwork) {
    return { Icon: WifiOff, title: 'Sin conexión con el servidor', description: error.message }
  }
  return { Icon: XCircle, title: 'Algo salió mal', description: error.message }
}

export function ErrorState({ error, onRetry, retryLabel = 'Reintentar', title, compact = false, className, extra }) {
  const normalized = normalizeApiError(error)
  const info = describe(normalized)
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger-text">
        <info.Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold text-fg">{title ?? info.title}</p>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{info.description}</p>
      {(onRetry || extra) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {onRetry && !normalized.isRateLimited && (
            <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw />}>
              {retryLabel}
            </Button>
          )}
          {extra}
        </div>
      )}
    </div>
  )
}
