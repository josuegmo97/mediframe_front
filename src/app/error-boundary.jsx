import { Component } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('ErrorBoundary', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <h1 className="text-2xl font-semibold text-fg">Algo salió mal</h1>
        <p className="max-w-md text-sm text-fg-muted">Ocurrió un error inesperado en la aplicación. Recarga la página para continuar.</p>
        <Button onClick={() => window.location.reload()} leftIcon={<RefreshCw />}>
          Recargar
        </Button>
      </div>
    )
  }
}
