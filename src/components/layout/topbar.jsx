import { useMatches } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Brand } from './brand'
import { MobileNavSheet } from './mobile-nav-sheet'
import { UserMenu } from './user-menu'

function useRouteTitle() {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const title = matches[i].handle?.title
    if (title) return title
  }
  return null
}

export function Topbar() {
  const title = useRouteTitle()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/75 sm:px-6 lg:h-16">
      <MobileNavSheet />
      <div className="lg:hidden">
        <Brand to="/" />
      </div>
      {title && <p className="hidden text-sm font-medium text-fg-muted lg:block">{title}</p>}
      <div className="flex-1" />
      <ThemeToggle />
      <div className="lg:hidden">
        <UserMenu />
      </div>
    </header>
  )
}
