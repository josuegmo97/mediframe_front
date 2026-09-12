import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { PasswordInput } from '@/components/ui/password-input'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { useUpdateProfile } from '../profile.queries'
import { changePasswordSchema } from '../schemas'

export function PasswordForm() {
  const mutation = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync({ password: values.password })
      toast.success('Contraseña actualizada')
      reset()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyFieldErrors(setError, normalized, ['password'])) setError('root', { message: normalized.message })
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>La nueva contraseña aplica de inmediato en tu próximo inicio de sesión.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nueva contraseña" required error={errors.password?.message}>
              <PasswordInput id="pwd-new" autoComplete="new-password" placeholder="Mínimo 6 caracteres" {...register('password')} />
            </FormField>
            <FormField label="Confirmar contraseña" required error={errors.confirmPassword?.message}>
              <PasswordInput id="pwd-confirm" autoComplete="new-password" placeholder="Repite la contraseña" {...register('confirmPassword')} />
            </FormField>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" variant="outline" loading={isSubmitting || mutation.isPending} leftIcon={<KeyRound />}>
            Actualizar contraseña
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
