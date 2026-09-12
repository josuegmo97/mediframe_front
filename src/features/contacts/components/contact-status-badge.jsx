import { Badge } from '@/components/ui/badge'
import { CONTACT_STATUS_META } from '@/lib/constants'

export function ContactStatusBadge({ status }) {
  const meta = CONTACT_STATUS_META[Number(status)] ?? { label: 'Desconocido', tone: 'neutral' }
  return (
    <Badge variant={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}
