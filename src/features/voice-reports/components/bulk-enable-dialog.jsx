import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/lib/toast'
import { useBulkSetVoiceReportEnabled } from '../voice-reports.queries'

/** Habilita en serie todos los dispositivos recibidos (normalmente los filtrados y aún no habilitados). */
export function BulkEnableDialog({ open, onOpenChange, devices }) {
  const mutation = useBulkSetVoiceReportEnabled()
  const count = devices.length

  const onConfirm = async () => {
    const { ok, failed } = await mutation.mutateAsync({ deviceIds: devices.map((d) => d.device_id), enabled: true })
    onOpenChange(false)
    if (!failed.length) return toast.success(`${ok} ${ok === 1 ? 'dispositivo habilitado' : 'dispositivos habilitados'}`)
    const rateLimited = failed.some((f) => f.error?.isRateLimited)
    toast.warning(`${ok} habilitados · ${failed.length} fallaron${rateLimited ? ' (límite de solicitudes; espera unos minutos y repite)' : ''}`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Habilitar ${count} ${count === 1 ? 'dispositivo' : 'dispositivos'}`}
      description="Se habilitará el dictado por voz en cada equipo de la lista actual que aún no lo tenga. Los que ya están habilitados no se tocan. Puedes revertirlo con el interruptor de cada fila."
      confirmLabel={mutation.isPending ? 'Habilitando…' : 'Habilitar todos'}
      loading={mutation.isPending}
      onConfirm={onConfirm}
    />
  )
}
