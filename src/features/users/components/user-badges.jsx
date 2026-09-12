import { Badge } from '@/components/ui/badge'
import { ROLE, ROLE_LABEL, USER_STATUS, USER_STATUS_LABEL } from '@/lib/constants'

export function RoleBadge({ role }) {
  const isAdmin = Number(role) === ROLE.ADMIN
  return <Badge variant={isAdmin ? 'accent' : 'neutral'}>{ROLE_LABEL[Number(role)] ?? 'Desconocido'}</Badge>
}

export function UserStatusBadge({ status }) {
  const active = Number(status) === USER_STATUS.ACTIVE
  return (
    <Badge variant={active ? 'success' : 'warning'} dot>
      {active ? USER_STATUS_LABEL[1] : 'Pendiente'}
    </Badge>
  )
}
