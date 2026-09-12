import { LogOut, RefreshCw } from 'lucide-react'
import { Brand } from '@/components/layout/brand'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { authStore } from '../auth-store'
import { useAuth } from '../auth-provider'

/** Pantalla de arranque de sesión. Si /auth/verify falla por red/429/5xx ofrece reintentar. */
export function SessionSplash() {
  const { bootError, retryBoot } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Brand size="lg" />
      {bootError ? (
        <div className="max-w-sm space-y-4">
          <p className="text-sm text-fg-muted">{bootError.message}</p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={retryBoot} leftIcon={<RefreshCw />}>
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => authStore.clearSession('user')} leftIcon={<LogOut />}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <Spinner size="sm" />
          Verificando sesión…
        </div>
      )}
    </div>
  )
}
