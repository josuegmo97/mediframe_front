import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KeyRound, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAtcQuery } from '@/features/atc/atc.queries'
import { DeleteLicenseDialog } from '@/features/licenses/components/delete-license-dialog'
import { LicenseDetailSections } from '@/features/licenses/components/license-detail-sections'
import { LicenseStatusBadge } from '@/features/licenses/components/license-status-badge'
import { useLicenseQuery } from '@/features/licenses/licenses.queries'
import { useUsageQuery } from '@/features/usage/usage.queries'
import { LICENSE_STATUS } from '@/lib/constants'
import { normalizeDeviceId } from '@/lib/device-description'
import { effectiveLicenseStatus, formatLicenseCode } from '@/lib/license-code'

export default function LicenseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const query = useLicenseQuery(id)
  const license = query.data
  useDocumentTitle(license ? `Licencia ${formatLicenseCode(license.code)}` : 'Licencia')
  const [deleting, setDeleting] = useState(false)

  // Datos relacionados solo desde cache (enabled:false): no se gastan peticiones extra
  const usage = useUsageQuery({ enabled: false })
  const atc = useAtcQuery({ enabled: false })

  const deviceKey = license?.device ? normalizeDeviceId(license.device) : null
  const usageItem = useMemo(() => (deviceKey ? usage.data?.items?.find((item) => normalizeDeviceId(item.device_id) === deviceKey) ?? null : null), [usage.data, deviceKey])
  const atcMessages = useMemo(() => (deviceKey && atc.data ? atc.data.filter((message) => normalizeDeviceId(message.device) === deviceKey) : []), [atc.data, deviceKey])

  if (query.isPending) return <PageSkeleton />

  if (query.isError && !license) {
    if (query.error?.isNotFound || query.error?.code === 'CAST_ERROR') {
      return <EmptyState icon={KeyRound} title="Licencia no encontrada" description="Puede que haya sido eliminada." action={<Button variant="outline" onClick={() => navigate('/licencias')}>Volver a licencias</Button>} />
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  }

  const deletable = effectiveLicenseStatus(license) === LICENSE_STATUS.AVAILABLE

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/licencias"
        backLabel="Licencias"
        title={<span className="font-mono tracking-wider">{formatLicenseCode(license.code)}</span>}
        meta={
          <span className="flex items-center gap-2">
            <CopyButton value={formatLicenseCode(license.code)} label="Copiar código" />
            <LicenseStatusBadge license={license} showDays />
          </span>
        }
        description={license.description || undefined}
        actions={
          deletable && (
            <Button variant="outline" className="text-danger-text hover:bg-danger/10" onClick={() => setDeleting(true)} leftIcon={<Trash2 />}>
              Eliminar
            </Button>
          )
        }
      />

      <LicenseDetailSections license={license} usageItem={usageItem} atcMessages={atcMessages} atcLoaded={Boolean(atc.data)} />

      <DeleteLicenseDialog license={license} open={deleting} onOpenChange={setDeleting} onDeleted={() => navigate('/licencias', { replace: true })} />
    </div>
  )
}
