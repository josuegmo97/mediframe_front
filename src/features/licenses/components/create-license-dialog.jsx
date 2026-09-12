import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Layers } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/cn'
import { LICENSE_DAY_PRESETS } from '@/lib/constants'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { useCreateLicense, useCreateLicenseBatch } from '../licenses.queries'
import { createLicenseSchema } from '../schemas'

const DEFAULTS = { mode: 'single', quantity: 5, days_permission: 365, description: '' }

/** Crear una licencia o un lote. Al terminar llama `onCreated({ codes, errors })`. */
export function CreateLicenseDialog({ open, onOpenChange, onCreated }) {
  const single = useCreateLicense()
  const batch = useCreateLicenseBatch()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createLicenseSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    if (open) reset(DEFAULTS)
  }, [open, reset])

  const mode = watch('mode')
  const days = watch('days_permission')
  const description = watch('description')
  const pending = isSubmitting || single.isPending || batch.isPending

  const onSubmit = async (values) => {
    try {
      if (values.mode === 'single') {
        const { license } = await single.mutateAsync({ days_permission: values.days_permission, description: values.description })
        onCreated({ codes: [{ code: license.code, days_permission: license.days_permission }], errors: [] })
      } else {
        const data = await batch.mutateAsync({ quantity: values.quantity, days_permission: values.days_permission, description: values.description })
        onCreated({ codes: data.licenses ?? [], errors: data.errors ?? [] })
      }
      onOpenChange(false)
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyFieldErrors(setError, normalized, ['quantity', 'days_permission', 'description'])) setError('root', { message: normalized.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Nueva licencia</DialogTitle>
            <DialogDescription>El código se genera automáticamente (16 dígitos). La vigencia empieza a contar cuando el cliente activa la licencia.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}

            <Segmented
              label="Tipo de creación"
              value={mode}
              onValueChange={(value) => setValue('mode', value, { shouldDirty: true })}
              options={[
                { value: 'single', label: 'Individual', icon: <KeyRound className="h-4 w-4" /> },
                { value: 'batch', label: 'Lote', icon: <Layers className="h-4 w-4" /> },
              ]}
            />

            {mode === 'batch' && (
              <FormField label="Cantidad de licencias" required hint="Entre 1 y 100 por lote." error={errors.quantity?.message}>
                <Input id="lic-quantity" type="number" inputMode="numeric" min={1} max={100} {...register('quantity')} />
              </FormField>
            )}

            <FormField label="Días de vigencia" required hint="Entre 1 y 365 días desde la activación." error={errors.days_permission?.message}>
              <Input id="lic-days" type="number" inputMode="numeric" min={1} max={365} {...register('days_permission')} />
            </FormField>
            <div className="-mt-3 flex flex-wrap gap-2" role="group" aria-label="Vigencias frecuentes">
              {LICENSE_DAY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('days_permission', preset, { shouldDirty: true, shouldValidate: true })}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    Number(days) === preset ? 'border-primary bg-primary/10 text-primary' : 'border-border text-fg-muted hover:border-border-strong hover:text-fg'
                  )}
                >
                  {preset} días
                </button>
              ))}
            </div>

            <FormField label="Descripción" hint="Opcional. Nota interna (cliente, lote, institución…)." error={errors.description?.message}>
              <Textarea id="lic-description" rows={3} maxLength={500} showCount value={description} placeholder="Ej. Lote para Clínica Central, renovación 2026" {...register('description')} />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {mode === 'single' ? 'Crear licencia' : 'Crear lote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
