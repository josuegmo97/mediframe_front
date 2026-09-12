import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatRelative, shortId } from '@/lib/format'
import { AtcRowActions } from './atc-row-actions'
import { AtcStatusBadge } from './atc-status-badge'

export function AtcMessageCard({ message, deviceName }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-fg-subtle" title={formatDateTime(message.created_at)}>
            {formatRelative(message.created_at)}
          </p>
          <p className="truncate text-sm font-medium text-fg">{deviceName ?? shortId(message.device, 18)}</p>
        </div>
        <AtcRowActions message={message} />
      </div>
      <Link to={`/soporte/${message._id}`} className="mt-2 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <p className="line-clamp-3 text-sm text-fg">{message.message}</p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AtcStatusBadge status={message.status} />
        <Badge variant="outline">v{message.version}</Badge>
      </div>
    </article>
  )
}
