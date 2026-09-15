import { Switch } from '@/components/ui/switch'
import { toast, toastApiError } from '@/lib/toast'
import { useUpdateVoiceReportDevice } from '../voice-reports.queries'

/** Interruptor de habilitación inline (lista/cards). No propaga el clic a la fila. */
export function VoiceReportEnableSwitch({ item, label }) {
  const mutation = useUpdateVoiceReportDevice()
  const pending = mutation.isPending
  return (
    <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} className="inline-flex">
      <Switch
        checked={item.enabled}
        disabled={pending}
        label={label}
        aria-label={`${item.enabled ? 'Deshabilitar' : 'Habilitar'} dictado en ${item.device_id}`}
        onCheckedChange={(enabled) =>
          mutation.mutate(
            { deviceId: item.device_id, patch: { enabled } },
            {
              onSuccess: () => toast.success(enabled ? 'Dictado habilitado' : 'Dictado deshabilitado', { id: `vr-enable-${item.device_id}` }),
              onError: (error) => toastApiError(error),
            }
          )
        }
      />
    </span>
  )
}
