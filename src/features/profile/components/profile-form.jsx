import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { useUpdateProfile } from '../profile.queries'
import { profileSchema } from '../schemas'

export function ProfileForm({ user }) {
  const mutation = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullname: user?.fullname ?? '', email: user?.email ?? '' },
  })

  useEffect(() => {
    reset({ fullname: user?.fullname ?? '', email: user?.email ?? '' })
  }, [user?.fullname, user?.email, reset])

  const onSubmit = async (values) => {
    const payload = {}
    if (values.fullname.trim() !== user.fullname) payload.fullname = values.fullname.trim()
    if (values.email.trim() && values.email.trim() !== (user.email ?? '')) payload.email = values.email.trim()
    if (!Object.keys(payload).length) {
      toast.info('No hay cambios para guardar')
      return
    }
    try {
      await mutation.mutateAsync(payload)
      toast.success('Perfil actualizado')
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyFieldErrors(setError, normalized, ['fullname', 'email'])) setError('root', { message: normalized.message })
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Tu nombre de usuario y tu rol los gestiona un administrador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Usuario">
              <Input id="profile-username" value={user?.username ?? ''} disabled readOnly />
            </FormField>
            <FormField label="Nombre completo" required error={errors.fullname?.message}>
              <Input id="profile-fullname" autoComplete="name" {...register('fullname')} />
            </FormField>
          </div>
          <FormField label="Correo" hint={user?.email ? 'Para quitar el correo contacta a un administrador.' : 'Opcional'} error={errors.email?.message}>
            <Input id="profile-email" type="email" autoComplete="email" inputMode="email" placeholder="correo@ejemplo.com" {...register('email')} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={isSubmitting || mutation.isPending} disabled={!isDirty} leftIcon={<Save />}>
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
