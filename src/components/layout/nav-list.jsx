import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/features/auth/auth-provider'
import { getNavItems } from './nav-items'

export function NavList({ onNavigate, className }) {
  const { isAdmin } = useAuth()
  const items = getNavItems(isAdmin)

  return (
    <nav aria-label="Principal" className={className}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:min-h-0',
                  isActive ? 'bg-accent/25 text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : 'text-fg-subtle')} aria-hidden="true" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
