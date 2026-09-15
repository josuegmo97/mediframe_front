import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Check, DollarSign, Mic, Timer, Users } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DescriptionList } from '@/components/ui/description-list'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { StatTile } from '@/components/ui/stat-tile'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { QuotaBar } from '@/features/voice-reports/components/quota-bar'
import { VoiceReportDeviceFormCard } from '@/features/voice-reports/components/voice-report-device-form-card'
import { VoiceReportStateBadge } from '@/features/voice-reports/components/voice-report-state-badge'
import { VoiceReportUsageTable } from '@/features/voice-reports/components/voice-report-usage-table'
import { useVoiceReportDeviceQuery, useVoiceReportSettingsQuery } from '@/features/voice-reports/voice-reports.queries'
import { reasonLabel, voiceDeviceLabel } from '@/features/voice-reports/voice-reports.utils'
import { VOICE_REPORT_PERIOD_LABEL } from '@/lib/constants'
import { normalizeDeviceId, parseDeviceDescription } from '@/lib/device-description'
import { formatDateTime, formatDuration, formatRelative, formatUsd, formatUtcDate } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'

export default function VoiceReportDevicePage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const query = useVoiceReportDeviceQuery(deviceId)
  const settings = useVoiceReportSettingsQuery()
  const item = query.data
  useDocumentTitle(item ? `Dictado · ${voiceDeviceLabel(item)}` : 'Dictado por voz')

  if (query.isPending) return <PageSkeleton />
  if (query.isError && !item) {
    if (query.error?.isNotFound) {
      return <EmptyState icon={Mic} title="Dispositivo no encontrado" description="Este identificador no tiene configuración ni dictados." action={<Button variant="outline" onClick={() => navigate('/dictado')}>Volver</Button>} />
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  }

  const usage = item.period_usage ?? {}
  const device = parseDeviceDescription(item.license?.device_description)
  const reason = reasonLabel(item.reason_code)
  const id = normalizeDeviceId(item.device_id)

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/dictado"
        backLabel="Dictado por voz"
        title={voiceDeviceLabel(item)}
        meta={<VoiceReportStateBadge state={item.state} reasonCode={item.reason_code} />}
        description={usage.last_used_at ? `Último dictado ${formatRelative(usage.last_used_at)}` : 'Sin dictados en el período actual'}
      />

      {query.isError && <Alert variant="warning">No se pudo actualizar el dispositivo. Mostrando datos guardados.</Alert>}
      {item.state !== 'available' && reason && (
        <Alert variant={item.state === 'blocked' ? 'danger' : 'info'} title={item.state === 'blocked' ? 'La app muestra el micrófono deshabilitado' : 'La app oculta el micrófono'}>
          Motivo: {reason}.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile label="Dictados" value={usage.success} icon={Mic} tone="success" />
        <StatTile label="Errores" value={usage.errors} icon={AlertTriangle} tone={usage.errors ? 'danger' : 'neutral'} />
        <StatTile label="Costo" value={formatUsd(usage.cost_usd)} icon={DollarSign} tone="warning" />
        <StatTile label="Audio dictado" value={formatDuration(usage.transcription_seconds)} icon={Timer} tone="info" />
        <StatTile label="Aceptados" value={usage.accepted} icon={Check} tone="success" hint={`${usage.discarded ?? 0} descartados`} />
        <StatTile label="Usuarios distintos" value={usage.distinct_users} icon={Users} tone="neutral" hint={`${usage.sessions ?? 0} sesiones`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <VoiceReportDeviceFormCard item={item} globalLimit={settings.data?.default_limit ?? null} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cuota del período</CardTitle>
              <CardDescription>
                {VOICE_REPORT_PERIOD_LABEL[item.quota?.period] ?? item.quota?.period} · reinicia el {formatUtcDate(item.quota?.resets_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuotaBar quota={item.quota} />
              <DescriptionList
                columns={3}
                items={[
                  { label: 'Límite', value: item.quota?.limit == null ? 'Sin límite' : item.quota.limit, hint: item.limit_override != null ? 'Propio del dispositivo' : 'Global' },
                  { label: 'Usados', value: item.quota?.used },
                  { label: 'Restantes', value: item.quota?.limit == null ? 'Sin límite' : item.quota.remaining },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispositivo y licencia</CardTitle>
              <CardDescription>{item.license ? 'Licencia vigente vinculada a este equipo.' : 'Sin licencia vigente: la app oculta el dictado aunque esté habilitado.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DescriptionList
                items={[
                  { label: 'Identificador', value: id, mono: true, copyable: true, span: true },
                  { label: 'Modelo', value: device?.modelLabel ?? device?.model ?? (device?.isParsed === false ? device.raw : null) },
                  { label: 'Nombre del equipo', value: device?.computerName },
                  { label: 'Propietario', value: item.license?.owner_name },
                  { label: 'Correo', value: item.license?.owner_email, href: item.license?.owner_email ? `mailto:${item.license.owner_email}` : undefined },
                  { label: 'Código', value: item.license ? formatLicenseCode(item.license.code) : null, mono: true, copyable: item.license ? formatLicenseCode(item.license.code) : false },
                  { label: 'Expira', value: item.license?.expired_at ? formatDateTime(item.license.expired_at) : null },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={item.license ? `/licencias?q=${encodeURIComponent(item.license.code)}` : `/licencias?q=${encodeURIComponent(id)}`}>{item.license ? 'Ver licencia' : 'Buscar en licencias'}</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/instalaciones/${encodeURIComponent(id)}`}>Ver telemetría</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <VoiceReportUsageTable deviceId={id} />
    </div>
  )
}
