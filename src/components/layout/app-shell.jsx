import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageSkeleton } from './page-skeleton'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell() {
  return (
    <div className="flex min-h-dvh bg-bg">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-content">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
