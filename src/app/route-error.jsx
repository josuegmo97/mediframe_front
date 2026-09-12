import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Pantalla de error de rutas (render/loader) con opción de recargar; reemplaza la genérica de React Router. */
export function RouteErrorPage() {
  const error = useRouteError()
  const isResponse = isRouteErrorResponse(error)
  if (import.meta.env.DEV) console.error('RouteError', error)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <h1 className="text-2xl font-semibold text-fg">{isResponse && error.status === 404 ? 'Página no encontrada' : 'Algo salió mal'}</h1>
      <p className="max-w-md text-sm text-fg-muted">
        {isResponse ? error.statusText || 'La página no se pudo cargar.' : 'Ocurrió un error inesperado al mostrar esta página. Recarga para continuar.'}
      </p>
      {import.meta.env.DEV && error?.message && (
        <pre className="max-w-2xl overflow-auto rounded-lg bg-surface-2 p-3 text-left text-xs text-fg-muted">{error.message}</pre>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
        <Button onClick={() => window.location.reload()} leftIcon={<RefreshCw />}>
          Recargar
        </Button>
      </div>
    </div>
  )
}
