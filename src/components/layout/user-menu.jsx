import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, Monitor, Moon, Sun, UserCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme/theme-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { cn } from '@/lib/cn'
import { ROLE_LABEL } from '@/lib/constants'

/** Menú de usuario: perfil, tema y cerrar sesión. `expanded` muestra nombre y rol junto al avatar. */
export function UserMenu({ expanded = false, className }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          expanded ? 'w-full p-2 hover:bg-surface-2' : 'p-0.5 hover:bg-surface-2',
          className
        )}
        aria-label={expanded ? undefined : 'Menú de usuario'}
      >
        <Avatar name={user.fullname} size={expanded ? 'md' : 'sm'} />
        {expanded && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-fg">{user.fullname}</span>
              <span className="block truncate text-xs text-fg-muted">{ROLE_LABEL[user.role] ?? 'Usuario'}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={expanded ? 'start' : 'end'} side={expanded ? 'top' : 'bottom'} className="w-64">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-fg">{user.fullname}</p>
          <p className="truncate text-xs text-fg-muted">@{user.username}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild icon={<UserCircle />}>
          <Link to="/perfil">
            <UserCircle />
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun />
            Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            Oscuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor />
            Sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive icon={<LogOut />} onSelect={logout}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
