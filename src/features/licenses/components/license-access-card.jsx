import { useState } from 'react'
import { FileCheck2, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { LICENSE_STATUS } from '@/lib/constants'
import { formatDateTime, formatRelative } from '@/lib/format'
import { effectiveLicenseStatus, formatLicenseCode } from '@/lib/license-code'
import { toast, toastApiError } from '@/lib/toast'
import { useCancelLicenseTerms, useRequestLicenseTerms, useSetLicensePaused } from '../licenses.queries'
import { isLicensePaused } from '../licenses.utils'

function PauseSection({ license }) {
  const mutation = useSetLicensePaused()
  const [confirming, setConfirming] = useState(false)
  const paused = isLicensePaused(license)
  const inUse = effectiveLicenseStatus(license) === LICENSE_STATUS.IN_USE

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ id: license._id, paused: !paused })
      toast.success(paused ? 'Licencia reanudada' : 'Licencia pausada')
      setConfirming(false)
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            Pausa de la licencia
            {paused && <Badge variant="warning" dot>Pausada</Badge>}
          </h3>
          <p className="text-sm text-fg-muted">
            {paused
              ? 'La app muestra "cuenta en mantenimiento" y no permite crear pacientes, estudios ni continuar estudios. Los días siguen corriendo.'
              : 'Al pausarla, el usuario puede navegar pero no crear pacientes, estudios ni continuar estudios. Los días siguen corriendo.'}
          </p>
          {paused && license.paused_at && (
            <p className="text-xs text-fg-subtle">Pausada el {formatDateTime(license.paused_at)} ({formatRelative(license.paused_at)})</p>
          )}
          {!inUse && !paused && <p className="text-xs text-fg-subtle">Solo se pueden pausar licencias en uso.</p>}
        </div>
        <Button
          variant={paused ? 'primary' : 'outline'}
          size="sm"
          disabled={!inUse && !paused}
          leftIcon={paused ? <PlayCircle /> : <PauseCircle />}
          onClick={() => setConfirming(true)}
        >
          {paused ? 'Reanudar' : 'Pausar'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={paused ? 'Reanudar licencia' : 'Pausar licencia'}
        description={
          paused
            ? 'El usuario podrá volver a crear pacientes y estudios la próxima vez que abra la app con internet.'
            : 'La próxima vez que el usuario abra la app con internet verá que su cuenta está en mantenimiento y deberá contactar a soporte. La vigencia no se detiene.'
        }
        confirmLabel={paused ? 'Reanudar' : 'Pausar'}
        variant={paused ? 'default' : 'danger'}
        loading={mutation.isPending}
        onConfirm={handleConfirm}
      >
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-center font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
      </ConfirmDialog>
    </section>
  )
}

function TermsSection({ license }) {
  const requestMutation = useRequestLicenseTerms()
  const cancelMutation = useCancelLicenseTerms()
  const [confirming, setConfirming] = useState(null) // 'request' | 'cancel' | null
  const pending = Boolean(license.terms_request_id)
  const acceptances = (license.terms_acceptances ?? []).filter((item) => item.request_id === license.terms_request_id)
  const busy = requestMutation.isPending || cancelMutation.isPending

  const handleConfirm = async () => {
    try {
      if (confirming === 'cancel') {
        await cancelMutation.mutateAsync(license._id)
        toast.success('Solicitud cancelada')
      } else {
        await requestMutation.mutateAsync(license._id)
        toast.success('Solicitud de términos enviada')
      }
      setConfirming(null)
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            Términos y condiciones de uso
            {pending && <Badge variant="info" dot>Solicitados</Badge>}
          </h3>
          <p className="text-sm text-fg-muted">
            Cada usuario y sub-usuario de esta licencia deberá leer y aceptar los términos al iniciar sesión (con internet).
          </p>
          {pending && license.terms_requested_at && (
            <p className="text-xs text-fg-subtle">
              Solicitados el {formatDateTime(license.terms_requested_at)} ({formatRelative(license.terms_requested_at)})
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {pending && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirming('cancel')}>
              Cancelar solicitud
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={busy} leftIcon={<FileCheck2 />} onClick={() => setConfirming('request')}>
            {pending ? 'Volver a solicitar' : 'Solicitar aceptación'}
          </Button>
        </div>
      </div>

      {pending && (
        <div className="rounded-lg border border-border">
          <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
            Aceptaciones ({acceptances.length})
          </p>
          {acceptances.length === 0 ? (
            <p className="px-3 py-3 text-sm text-fg-muted">Aún nadie ha aceptado esta solicitud.</p>
          ) : (
            <ul className="divide-y divide-border">
              {acceptances.map((item, index) => (
                <li key={`${item.accepted_at}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-fg">{item.user_name || 'Usuario sin nombre'}</span>
                    {item.is_sub_user && <Badge variant="neutral">Sub-usuario</Badge>}
                  </span>
                  <span className="text-xs text-fg-subtle">{formatDateTime(item.accepted_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={confirming === 'cancel' ? 'Cancelar solicitud de términos' : 'Solicitar aceptación de términos'}
        description={
          confirming === 'cancel'
            ? 'Los usuarios que aún no aceptaron dejarán de ver el aviso.'
            : pending
              ? 'Se creará una nueva solicitud: todos los usuarios, incluso quienes ya aceptaron, deberán aceptar de nuevo.'
              : 'Al iniciar sesión con internet, cada usuario y sub-usuario verá los términos y deberá aceptarlos para continuar.'
        }
        confirmLabel={confirming === 'cancel' ? 'Cancelar solicitud' : 'Solicitar'}
        cancelLabel="Volver"
        variant={confirming === 'cancel' ? 'danger' : 'default'}
        loading={busy}
        onConfirm={handleConfirm}
      />
    </section>
  )
}

export function LicenseAccessCard({ license }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex-row items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-fg-muted">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Control de acceso</CardTitle>
          <CardDescription>Los cambios se aplican la próxima vez que la app se abra con internet.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <PauseSection license={license} />
        <div className="border-t border-border" />
        <TermsSection license={license} />
      </CardContent>
    </Card>
  )
}
