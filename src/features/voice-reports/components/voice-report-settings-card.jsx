import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Settings2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { formatRelative } from '@/lib/format'
import { toast } from '@/lib/toast'
import { settingsSchema } from '../schemas'
import { useUpdateVoiceReportSettings } from '../voice-reports.queries'

const MB = 1_000_000

function defaultsFor(settings) {
  return {
    enabled: Boolean(settings?.enabled),
    default_device_enabled: Boolean(settings?.default_device_enabled),
    default_limit: settings?.default_limit == null ? '' : String(settings.default_limit),
    period: settings?.period ?? 'monthly',
    max_duration_seconds: settings?.max_duration_seconds ?? 180,
    max_audio_mb: settings?.max_audio_bytes ? Math.round((settings.max_audio_bytes / MB) * 100) / 100 : 3,
  }
}

/** Solo se envían los campos que cambiaron respecto a lo guardado. */
function diffSettings(values, settings) {
  const patch = {}
  if (values.enabled !== Boolean(settings.enabled)) patch.enabled = values.enabled
  if (values.default_device_enabled !== Boolean(settings.default_device_enabled)) patch.default_device_enabled = values.default_device_enabled
  if (values.default_limit !== (settings.default_limit ?? null)) patch.default_limit = values.default_limit
  if (values.period !== settings.period) patch.period = values.period
  if (values.max_duration_seconds !== settings.max_duration_seconds) patch.max_duration_seconds = values.max_duration_seconds
  const bytes = Math.round(values.max_audio_mb * MB)
  if (bytes !== settings.max_audio_bytes) patch.max_audio_bytes = bytes
  return patch
}

/** Configuración global del dictado por voz (flag, cuota por defecto, límites de audio). */
export function VoiceReportSettingsCard({ settings, loading }) {
  const mutation = useUpdateVoiceReportSettings()
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(settingsSchema), defaultValues: defaultsFor(settings) })

  useEffect(() => {
    if (settings) reset(defaultsFor(settings))
  }, [settings, reset])

  const enabled = watch('enabled')

  const onSubmit = async (values) => {
    const patch = diffSettings(values, settings)
    if (!Object.keys(patch).length) return toast.info('No hay cambios que guardar')
    try {
      await mutation.mutateAsync(patch)
      toast.success('Configuración guardada')
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
              <Settings2 className="h-4 w-4 text-fg-muted" aria-hidden="true" />
              Configuración global
            </CardTitle>
            <CardDescription>Aplica a toda la flota. Los cambios se reflejan en la app sin redistribuirla.</CardDescription>
          </div>
          {settings?.updated_at && <span className="shrink-0 text-xs text-fg-subtle">Actualizada {formatRelative(settings.updated_at)}</span>}
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller name="enabled" control={control} render={({ field }) => <Switch id="vr-enabled" checked={field.value} onCheckedChange={field.onChange} label="Dictado por voz activo" />} />
                <Controller name="default_device_enabled" control={control} render={({ field }) => <Switch id="vr-default-device" checked={field.value} onCheckedChange={field.onChange} label="Habilitar dispositivos nuevos por defecto" />} />
              </div>
              {!enabled && (
                <Alert variant="warning">Con la función apagada, el botón de micrófono se oculta en todas las instalaciones aunque estén habilitadas.</Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField label="Dictados por período" htmlFor="vr-limit" error={errors.default_limit?.message} hint="Vacío = sin límite">
                  <Input type="number" min={0} step={1} inputMode="numeric" placeholder="Sin límite" {...register('default_limit')} />
                </FormField>
                <FormField label="Período" htmlFor="vr-period" error={errors.period?.message}>
                  <Select options={[{ value: 'monthly', label: 'Mensual' }, { value: 'daily', label: 'Diario' }]} {...register('period')} />
                </FormField>
                <FormField label="Duración máx. (s)" htmlFor="vr-duration" error={errors.max_duration_seconds?.message}>
                  <Input type="number" min={1} step={1} inputMode="numeric" {...register('max_duration_seconds')} />
                </FormField>
                <FormField label="Audio máx. (MB)" htmlFor="vr-audio" error={errors.max_audio_mb?.message}>
                  <Input type="number" min={0.01} step={0.1} inputMode="decimal" {...register('max_audio_mb')} />
                </FormField>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={mutation.isPending} disabled={loading || !isDirty} leftIcon={<Save />}>
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
