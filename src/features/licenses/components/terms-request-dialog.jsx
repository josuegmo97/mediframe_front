import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatLicenseCode } from '@/lib/license-code'
import { toast, toastApiError } from '@/lib/toast'
import { useCancelLicenseTerms, useRequestLicenseTerms } from '../licenses.queries'

/** Confirma solicitar (o volver a solicitar) o cancelar la aceptación de términos. mode: 'request' | 'cancel' | null. */
export function TermsRequestDialog({ license, mode, onClose }) {
  const requestMutation = useRequestLicenseTerms()
  const cancelMutation = useCancelLicenseTerms()
  const busy = requestMutation.isPending || cancelMutation.isPending
  const pending = Boolean(license?.terms_request_id)
  const cancelling = mode === 'cancel'

  const handleConfirm = async () => {
    try {
      if (cancelling) {
        await cancelMutation.mutateAsync(license._id)
        toast.success('Solicitud cancelada')
      } else {
        await requestMutation.mutateAsync(license._id)
        toast.success('Solicitud de términos enviada')
      }
      onClose()
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <ConfirmDialog
      open={Boolean(license) && mode !== null}
      onOpenChange={(open) => !open && onClose()}
      title={cancelling ? 'Cancelar solicitud de términos' : 'Solicitar aceptación de términos'}
      description={
        cancelling
          ? 'Los usuarios que aún no aceptaron dejarán de ver el aviso y se borrarán las aceptaciones registradas de esta solicitud.'
          : pending
            ? 'Se creará una nueva solicitud: todos los usuarios, incluso quienes ya aceptaron, deberán aceptar de nuevo.'
            : 'Con internet, cada usuario y sub-usuario verá los términos al iniciar sesión (o en menos de 10 minutos si ya tiene la app abierta) y deberá aceptarlos para continuar.'
      }
      confirmLabel={cancelling ? 'Cancelar solicitud' : 'Solicitar'}
      cancelLabel="Volver"
      variant={cancelling ? 'danger' : 'default'}
      loading={busy}
      onConfirm={handleConfirm}
    >
      {license && <p className="rounded-lg bg-surface-2 px-3 py-2 text-center font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>}
    </ConfirmDialog>
  )
}
