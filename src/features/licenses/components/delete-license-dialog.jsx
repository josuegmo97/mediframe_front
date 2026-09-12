import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatLicenseCode } from '@/lib/license-code'
import { toast, toastApiError } from '@/lib/toast'
import { useDeleteLicense } from '../licenses.queries'

export function DeleteLicenseDialog({ license, open, onOpenChange, onDeleted }) {
  const mutation = useDeleteLicense()
  if (!license) return null

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(license._id)
      toast.success(`Licencia ${formatLicenseCode(license.code)} eliminada`)
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar licencia"
      description="Esta acción no se puede deshacer. Solo se pueden eliminar licencias disponibles (nunca activadas)."
      confirmLabel="Eliminar"
      variant="danger"
      loading={mutation.isPending}
      onConfirm={handleConfirm}
    >
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-center font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
    </ConfirmDialog>
  )
}
