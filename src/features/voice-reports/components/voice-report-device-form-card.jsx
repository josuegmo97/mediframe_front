import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { formatRelative } from '@/lib/format'
import { toast } from '@/lib/toast'
import { deviceSchema } from '../schemas'
import { useUpdateVoiceReportDevice } from '../voice-reports.queries'

function defaultsFor(item) {
  return {
    enabled: Boolean(item?.enabled),
    blocked_by_admin: Boolean(item?.blocked_by_admin),
    limit_override: item?.limit_override == null ? '' : String(item.limit_override),
    notes: item?.notes ?? '',
  }
}

function diffDevice(values, item) {
  const patch = {}
  if (values.enabled !== Boolean(item.enabled)) patch.enabled = values.enabled
  if (values.blocked_by_admin !== Boolean(item.blocked_by_admin)) patch.blocked_by_admin = values.blocked_by_admin
  if (values.limit_override !== (item.limit_override ?? null)) patch.limit_override = values.limit_override
  const notes = values.notes.trim()
  if (notes !== (item.notes ?? '')) patch.notes = notes || null
  return patch
}

/** Habilitación, bloqueo, límite propio y notas de un dispositivo. */
export function VoiceReportDeviceFormCard({ item, globalLimit }) {
  const mutation = useUpdateVoiceReportDevice()
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(deviceSchema), defaultValues: defaultsFor(item) })

  useEffect(() => {
    reset(defaultsFor(item))
  }, [item, reset])

  const notes = watch('notes')

  const onSubmit = async (values) => {
    const patch = diffDevice(values, item)
    if (!Object.keys(patch).length) return toast.info('No hay cambios que guardar')
    try {
      await mutation.mutateAsync({ deviceId: item.device_id, patch })
      toast.success('Dispositivo actualizado')
    } catch (error) {
      if (!applyFieldErrors(setError, error)) toast.error(normalizeApiError(error).message)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-fg-muted" aria-hidden="true" />
              Control del dispositivo
            </CardTitle>
            <CardDescription>{item.has_settings ? 'Este dispositivo tiene configuración propia.' : 'Sin configuración propia: hereda los valores globales hasta que guardes.'}</CardDescription>
          </div>
          {item.updated_at && <span className="shrink-0 text-xs text-fg-subtle">Editado {formatRelative(item.updated_at)}</span>}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller name="enabled" control={control} render={({ field }) => <Switch id="vrd-enabled" checked={field.value} onCheckedChange={field.onChange} label="Habilitado para dictar" />} />
            <Controller name="blocked_by_admin" control={control} render={({ field }) => <Switch id="vrd-blocked" checked={field.value} onCheckedChange={field.onChange} label="Bloqueado por el administrador" />} />
          </div>
          <FormField label="Límite propio de dictados" htmlFor="vrd-limit" error={errors.limit_override?.message} hint={globalLimit == null ? 'Vacío = usa el global (sin límite)' : `Vacío = usa el global (${globalLimit})`}>
            <Input type="number" min={0} step={1} inputMode="numeric" placeholder="Usar el global" className="sm:max-w-xs" {...register('limit_override')} />
          </FormField>
          <FormField label="Notas internas" htmlFor="vrd-notes" error={errors.notes?.message}>
            <Textarea rows={3} maxLength={2000} showCount value={notes} placeholder="Plan, consultorio, acuerdos…" {...register('notes')} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty} leftIcon={<Save />}>
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
