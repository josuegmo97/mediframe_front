import { Badge } from '@/components/ui/badge'
import { ATC_STATUS_META } from '@/lib/constants'

export function AtcStatusBadge({ status }) {
  const meta = ATC_STATUS_META[Number(status)] ?? { label: 'Desconocido', tone: 'neutral' }
  return (
    <Badge variant={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}
