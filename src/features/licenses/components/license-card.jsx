import { Link } from 'react-router-dom'
import { CopyButton } from '@/components/ui/copy-button'
import { deviceLabel } from '@/lib/device-description'
import { formatDate } from '@/lib/format'
import { formatLicenseCode, licenseDaysRemaining } from '@/lib/license-code'
import { LicenseRowActions } from './license-row-actions'
import { LicenseStatusBadge } from './license-status-badge'

/** Licencia en formato card (móvil). */
export function LicenseCard({ license }) {
  const days = licenseDaysRemaining(license)
  const device = deviceLabel(license.device_description, license.device)
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/licencias/${license._id}`} className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <p className="font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
        </Link>
        <CopyButton value={formatLicenseCode(license.code)} label="Copiar código" />
        <LicenseRowActions license={license} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <LicenseStatusBadge license={license} />
        <span className="text-xs text-fg-subtle">{license.days_permission} días</span>
        {days != null && <span className="text-xs text-fg-subtle">· vence en {days} d ({formatDate(license.expired_at)})</span>}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-fg-subtle">Propietario</dt>
          <dd className="truncate text-fg">{license.owner_name || '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-fg-subtle">Dispositivo</dt>
          <dd className="truncate text-fg">{device || '—'}</dd>
        </div>
      </dl>
    </article>
  )
}
