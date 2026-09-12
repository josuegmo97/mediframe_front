import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { USAGE_TRIGGER_LABEL } from '@/lib/constants'
import { formatNumber, formatRelative, shortId } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'
import { installationLabel } from '../usage.utils'

export function UsageCard({ item }) {
  return (
    <Link to={`/instalaciones/${encodeURIComponent(item.device_id)}`} className="block rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{installationLabel(item)}</p>
          <p className="truncate font-mono text-xs text-fg-subtle">{shortId(item.device_id, 18)}</p>
        </div>
        <Badge variant="outline">v{item.version}</Badge>
      </div>
      <p className="mt-2 truncate text-sm text-fg-muted">
        {item.license ? `${item.license.owner_name || 'Sin nombre'} · ${formatLicenseCode(item.license.code)}` : 'Sin licencia asociada'}
      </p>
      <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[
          ['Pacientes', item.patients],
          ['Historias', item.histories],
          ['Usuarios', item.users],
          ['PDF', item.pdf],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-surface-2 py-2">
            <dd className="text-base font-semibold tabular-nums text-fg">{formatNumber(value)}</dd>
            <dt className="text-[11px] text-fg-subtle">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-fg-subtle">
        {USAGE_TRIGGER_LABEL[item.trigger] ?? item.trigger} · {formatRelative(item.received_at)}
      </p>
    </Link>
  )
}
