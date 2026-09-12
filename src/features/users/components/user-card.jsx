import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/format'
import { RoleBadge, UserStatusBadge } from './user-badges'
import { UserRowActions } from './user-row-actions'

/** Fila de usuario en formato card (móvil). */
export function UserCard({ user, users, onEdit }) {
  return (
    <article className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <Avatar name={user.fullname} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-fg">{user.fullname}</p>
            <p className="truncate text-sm text-fg-muted">@{user.username}</p>
          </div>
          <UserRowActions user={user} users={users} onEdit={onEdit} />
        </div>
        {user.email && <p className="truncate text-sm text-fg-muted">{user.email}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
          <span className="text-xs text-fg-subtle">Registro {formatDate(user.created_at)}</span>
        </div>
      </div>
    </article>
  )
}
