import { Badge } from '@/components/ui/badge'
import { LICENSE_STATUS } from '@/lib/constants'
import { effectiveLicenseStatus, licenseDaysRemaining, licenseStatusMeta } from '@/lib/license-code'
import { isExpiringSoon } from '../licenses.utils'

export function LicenseStatusBadge({ license, showDays = false }) {
  const status = effectiveLicenseStatus(license)
  const meta = licenseStatusMeta(status)
  const soon = status === LICENSE_STATUS.IN_USE && isExpiringSoon(license)
  const days = showDays ? licenseDaysRemaining(license) : null
  return (
    <Badge variant={soon ? 'warning' : meta.tone} dot>
      {meta.label}
      {days != null && <span className="tabular-nums font-normal opacity-80">· {days} d</span>}
    </Badge>
  )
}
