import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatLicenseCode } from '@/lib/license-code'
import { toast, toastApiError } from '@/lib/toast'
import { useSetLicensePaused } from '../licenses.queries'
import { isLicensePaused } from '../licenses.utils'

/** Confirma pausar o reanudar (según el estado actual) una licencia en uso. */
export function PauseLicenseDialog({ license, open, onOpenChange }) {
  const mutation = useSetLicensePaused()
  const paused = isLicensePaused(license)

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ id: license._id, paused: !paused })
      toast.success(paused ? 'Licencia reanudada' : 'Licencia pausada')
      onOpenChange(false)
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={paused ? 'Reanudar licencia' : 'Pausar licencia'}
      description={
        paused
          ? 'El usuario podrá volver a crear pacientes y estudios en la próxima verificación de la app con internet (al abrirla o en menos de 10 minutos si ya está abierta).'
          : 'En la próxima verificación de la app con internet (al abrirla o en menos de 10 minutos si ya está abierta) el usuario verá que su cuenta está en mantenimiento y deberá contactar a soporte. La vigencia no se detiene.'
      }
      confirmLabel={paused ? 'Reanudar' : 'Pausar'}
      variant={paused ? 'default' : 'danger'}
      loading={mutation.isPending}
      onConfirm={handleConfirm}
    >
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-center font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
    </ConfirmDialog>
  )
}
