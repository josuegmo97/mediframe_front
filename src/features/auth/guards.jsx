import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import ForbiddenPage from '@/pages/forbidden-page'
import { useAuth } from './auth-provider'
import { SessionSplash } from './components/session-splash'

/** Rutas privadas: muestra splash mientras arranca la sesión y redirige a /ingresar si no hay usuario. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'booting') return <SessionSplash />
  if (status === 'anonymous') return <Navigate to="/ingresar" replace state={{ from: location }} />
  return <Outlet />
}

/** Rutas de administrador: renderiza "Sin permisos" en sitio (sin peticiones) para espectadores. */
export function RequireAdmin() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <ForbiddenPage />
  return <Outlet />
}

/** Rutas públicas (login/registro): un usuario autenticado vuelve a donde iba. */
export function PublicOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'booting') return <SessionSplash />
  if (status === 'authenticated') {
    const from = location.state?.from
    const to = from?.pathname ? `${from.pathname}${from.search ?? ''}` : '/'
    return <Navigate to={to} replace />
  }
  return (
    <Suspense fallback={<SessionSplash />}>
      <Outlet />
    </Suspense>
  )
}
