import { CalendarDays, ShieldCheck } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { RoleBadge, UserStatusBadge } from '@/features/users/components/user-badges'
import { formatDate } from '@/lib/format'

export function AccountSummaryCard({ user }) {
  if (!user) return null
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <Avatar name={user.fullname} size="xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h2 className="truncate text-xl font-semibold text-fg">{user.fullname}</h2>
            <p className="truncate text-sm text-fg-muted">@{user.username}{user.email ? ` · ${user.email}` : ''}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <RoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
          <dl className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-fg-muted sm:justify-start">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <dt>Miembro desde</dt>
              <dd className="font-medium text-fg">{formatDate(user.created_at)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <dt>Última actualización</dt>
              <dd className="font-medium text-fg">{formatDate(user.updated_at)}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}
