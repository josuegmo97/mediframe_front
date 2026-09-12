import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-fg-muted">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-fg-muted">La dirección que abriste no existe o fue movida.</p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="h-4 w-4" />
          Ir al inicio
        </Link>
      </Button>
    </div>
  )
}
