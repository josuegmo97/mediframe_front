import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/app/error-boundary'
import { Providers } from '@/app/providers'
import { router } from '@/app/router'

export default function App() {
  return (
    <Providers>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </Providers>
  )
}
