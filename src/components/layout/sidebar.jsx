import { APP_VERSION } from '@/lib/constants'
import { Brand } from './brand'
import { NavList } from './nav-list'
import { UserMenu } from './user-menu'

/** Barra lateral fija (≥ lg). */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-5">
        <Brand to="/" />
      </div>
      <NavList className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin" />
      <div className="border-t border-border p-3">
        <UserMenu expanded />
        <p className="mt-2 px-2 text-[11px] text-fg-subtle">v{APP_VERSION}</p>
      </div>
    </aside>
  )
}
