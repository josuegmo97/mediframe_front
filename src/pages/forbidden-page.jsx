import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, LockKeyhole, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAuth } from '@/features/auth/auth-provider'
import { toastApiError } from '@/lib/toast'

export default function ForbiddenPage() {
  useDocumentTitle('Sin permisos')
  const { refreshUser } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
    } catch (error) {
      toastApiError(error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-warning/15 text-warning-fg dark:text-warning">
        <LockKeyhole className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Sin permisos</h1>
      <p className="mt-2 max-w-md text-sm text-fg-muted">
        Esta sección requiere rol de administrador. Si te acaban de dar permisos, actualiza tu sesión.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" leftIcon={<Home />}>
          <Link to="/">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
        <Button onClick={handleRefresh} loading={refreshing} leftIcon={<RefreshCw />}>
          Actualizar sesión
        </Button>
      </div>
    </div>
  )
}
