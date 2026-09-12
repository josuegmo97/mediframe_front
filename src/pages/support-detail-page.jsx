import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, LifeBuoy, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DescriptionList } from '@/components/ui/description-list'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAtcMessageQuery, useUpdateAtcStatus } from '@/features/atc/atc.queries'
import { AtcStatusBadge } from '@/features/atc/components/atc-status-badge'
import { LicenseStatusBadge } from '@/features/licenses/components/license-status-badge'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { ATC_STATUS } from '@/lib/constants'
import { deviceLabel, normalizeDeviceId } from '@/lib/device-description'
import { formatDateTime, formatRelative } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'
import { toast, toastApiError } from '@/lib/toast'

export default function SupportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const query = useAtcMessageQuery(id)
  const message = query.data
  useDocumentTitle('Mensaje de soporte')
  const mutation = useUpdateAtcStatus()
  const licenses = useLicensesQuery({ enabled: false })

  const license = useMemo(() => {
    if (!message?.device || !licenses.data) return null
    const key = normalizeDeviceId(message.device)
    return licenses.data.find((l) => normalizeDeviceId(l.device) === key) ?? null
  }, [licenses.data, message])

  if (query.isPending) return <PageSkeleton />
  if (query.isError && !message) {
    if (query.error?.isNotFound || query.error?.code === 'CAST_ERROR') {
      return <EmptyState icon={LifeBuoy} title="Mensaje no encontrado" action={<Button variant="outline" onClick={() => navigate('/soporte')}>Volver a soporte</Button>} />
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  }

  const handled = Number(message.status) === ATC_STATUS.HANDLED
  const toggle = async () => {
    try {
      await mutation.mutateAsync({ id: message._id, status: handled ? ATC_STATUS.PENDING : ATC_STATUS.HANDLED })
      toast.success(handled ? 'Mensaje marcado como pendiente' : 'Mensaje marcado como atendido')
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/soporte"
        backLabel="Soporte"
        title="Mensaje de soporte"
        meta={
          <span className="flex items-center gap-2">
            <AtcStatusBadge status={message.status} />
            <Badge variant="outline">v{message.version}</Badge>
          </span>
        }
        description={`Recibido ${formatDateTime(message.created_at)} (${formatRelative(message.created_at)})`}
        actions={
          <Button variant={handled ? 'outline' : 'primary'} onClick={toggle} loading={mutation.isPending} leftIcon={handled ? <RotateCcw /> : <CheckCircle2 />}>
            {handled ? 'Marcar como pendiente' : 'Marcar como atendido'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-fg">{message.message}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivo</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: 'Identificador', value: message.device, mono: true, copyable: true },
                  { label: 'Versión de la app', value: message.version },
                  { label: 'Equipo', value: license ? deviceLabel(license.device_description, null) : null },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Licencia del dispositivo</CardTitle>
              <CardDescription>{licenses.data ? (license ? 'Licencia vinculada a esta Mac.' : 'No hay licencia vinculada a este identificador.') : 'Carga las licencias para vincular el mensaje.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {license ? (
                <>
                  <DescriptionList
                    columns={1}
                    items={[
                      { label: 'Código', value: formatLicenseCode(license.code), mono: true },
                      { label: 'Propietario', value: license.owner_name },
                      { label: 'Correo', value: license.owner_email, href: license.owner_email ? `mailto:${license.owner_email}` : undefined },
                      { label: 'Teléfono', value: license.owner_phone, href: license.owner_phone ? `tel:${license.owner_phone}` : undefined },
                    ]}
                  />
                  <div className="flex items-center gap-3">
                    <LicenseStatusBadge license={license} showDays />
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to={`/licencias/${license._id}`}>Ver licencia</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/licencias?q=${encodeURIComponent(normalizeDeviceId(message.device))}`}>Buscar en licencias</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
