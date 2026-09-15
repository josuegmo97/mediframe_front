import { Link } from 'react-router-dom'
import { formatNumber, formatRelative, formatUsd, shortId } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'
import { voiceDeviceLabel } from '../voice-reports.utils'
import { QuotaBar } from './quota-bar'
import { VoiceReportStateBadge } from './voice-report-state-badge'

export function VoiceReportDeviceCard({ item }) {
  const usage = item.period_usage ?? {}
  return (
    <Link to={`/dictado/${encodeURIComponent(item.device_id)}`} className="block rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{voiceDeviceLabel(item)}</p>
          <p className="truncate font-mono text-xs text-fg-subtle">{shortId(item.device_id, 18)}</p>
        </div>
        <VoiceReportStateBadge state={item.state} reasonCode={item.reason_code} />
      </div>
      <p className="mt-2 truncate text-sm text-fg-muted">
        {item.license ? `${item.license.owner_name || 'Sin nombre'} · ${formatLicenseCode(item.license.code)}` : 'Sin licencia vigente'}
      </p>
      <QuotaBar quota={item.quota} className="mt-3" />
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ['Errores', formatNumber(usage.errors)],
          ['Costo', formatUsd(usage.cost_usd, { compact: true })],
          ['Usuarios', formatNumber(usage.distinct_users)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-surface-2 py-2">
            <dd className="text-base font-semibold tabular-nums text-fg">{value}</dd>
            <dt className="text-[11px] text-fg-subtle">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-fg-subtle">{usage.last_used_at ? `Último dictado ${formatRelative(usage.last_used_at)}` : 'Sin dictados en el período'}</p>
    </Link>
  )
}
