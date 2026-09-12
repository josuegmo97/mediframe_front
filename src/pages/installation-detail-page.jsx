import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText, FolderHeart, MonitorSmartphone, Stethoscope, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { DescriptionList } from '@/components/ui/description-list'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { StatTile } from '@/components/ui/stat-tile'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { useUsageDeviceQuery } from '@/features/usage/usage.queries'
import { installationLabel } from '@/features/usage/usage.utils'
import { USAGE_TRIGGER_LABEL } from '@/lib/constants'
import { normalizeDeviceId, parseDeviceDescription } from '@/lib/device-description'
import { formatDateTime, formatRelative } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'

export default function InstallationDetailPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const query = useUsageDeviceQuery(deviceId)
  const item = query.data
  useDocumentTitle(item ? `Instalación ${installationLabel(item)}` : 'Instalación')

  const licenses = useLicensesQuery({ enabled: false })
  const linkedLicense = useMemo(() => {
    if (!item?.license?.code) return null
    return licenses.data?.find((license) => license.code === item.license.code) ?? null
  }, [licenses.data, item])

  if (query.isPending) return <PageSkeleton />
  if (query.isError && !item) {
    if (query.error?.isNotFound) {
      return <EmptyState icon={MonitorSmartphone} title="Instalación no encontrada" description="Este dispositivo no ha enviado telemetría." action={<Button variant="outline" onClick={() => navigate('/instalaciones')}>Volver a instalaciones</Button>} />
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  }

  const device = parseDeviceDescription(item.license?.device_description)
  const licenseLink = linkedLicense ? `/licencias/${linkedLicense._id}` : item.license ? `/licencias?q=${encodeURIComponent(item.license.code)}` : null

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/instalaciones"
        backLabel="Instalaciones"
        title={installationLabel(item)}
        meta={<Badge variant="outline">v{item.version}</Badge>}
        description={`Último evento: ${USAGE_TRIGGER_LABEL[item.trigger] ?? item.trigger} · ${formatRelative(item.received_at)}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Pacientes" value={item.patients} icon={Stethoscope} tone="info" />
        <StatTile label="Historias" value={item.histories} icon={FolderHeart} tone="success" />
        <StatTile label="Usuarios de la app" value={item.users} icon={Users} tone="neutral" />
        <StatTile label="PDF generados" value={item.pdf} icon={FileText} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispositivo</CardTitle>
            <CardDescription>Identificador que reporta la app y datos del equipo.</CardDescription>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: 'Identificador', value: normalizeDeviceId(item.device_id), mono: true, copyable: true, span: true },
                { label: 'Modelo', value: device?.modelLabel ?? device?.model ?? (device?.isParsed === false ? device.raw : null) },
                { label: 'Nombre del equipo', value: device?.computerName },
                { label: 'Arquitectura', value: device?.arch },
                { label: 'Versión de la app', value: item.version },
                { label: 'Primera sincronización', value: formatDateTime(item.created_at) },
                { label: 'Última sincronización', value: `${formatDateTime(item.received_at)} (${formatRelative(item.received_at)})` },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Licencia</CardTitle>
            <CardDescription>{item.license ? 'Licencia vinculada a este dispositivo.' : 'Este dispositivo no tiene licencia asociada.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.license ? (
              <>
                <DescriptionList
                  items={[
                    { label: 'Código', value: formatLicenseCode(item.license.code), mono: true, copyable: formatLicenseCode(item.license.code) },
                    { label: 'Estado', value: item.license.status_text },
                    { label: 'Propietario', value: item.license.owner_name },
                    { label: 'Identificación', value: item.license.owner_identification },
                    { label: 'Teléfono', value: item.license.owner_phone, href: item.license.owner_phone ? `tel:${item.license.owner_phone}` : undefined },
                    { label: 'Correo', value: item.license.owner_email, href: item.license.owner_email ? `mailto:${item.license.owner_email}` : undefined },
                    { label: 'Días de permiso', value: item.license.days_permission ? `${item.license.days_permission} días` : null },
                    { label: 'Expira', value: item.license.expired_at ? `${formatDateTime(item.license.expired_at)}${item.license.days_remaining != null ? ` · quedan ${item.license.days_remaining} d` : ''}` : null },
                  ]}
                />
                <Button asChild variant="outline" size="sm">
                  <Link to={licenseLink}>Ver licencia</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CopyButton value={normalizeDeviceId(item.device_id)} label="Copiar identificador" showLabel variant="outline" />
                <Button asChild variant="link" size="sm">
                  <Link to={`/licencias?q=${encodeURIComponent(normalizeDeviceId(item.device_id))}`}>Buscar en licencias</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
