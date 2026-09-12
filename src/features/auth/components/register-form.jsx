import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { useAuth } from '../auth-provider'
import { registerSchema } from '../schemas'

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', fullname: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      const username = values.username.trim().toLowerCase()
      await registerUser({ username, fullname: values.fullname.trim(), email: values.email.trim() || undefined, password: values.password })
      navigate('/ingresar', { replace: true, state: { registered: true, username } })
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyFieldErrors(setError, normalized, ['username', 'email', 'password', 'fullname'])) {
        setServerError(normalized)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Alert variant="info">Tu cuenta quedará pendiente hasta que un administrador la active.</Alert>

      {serverError && (
        <Alert variant="danger" title={serverError.isRateLimited ? 'Demasiados intentos' : undefined}>
          {serverError.isRateLimited ? 'Por seguridad, espera 15 minutos antes de volver a intentarlo.' : serverError.message}
        </Alert>
      )}

      <FormField label="Usuario" required hint="Letras, números y guion bajo" error={errors.username?.message}>
        <Input id="reg-username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="tu_usuario" {...register('username')} />
      </FormField>

      <FormField label="Nombre completo" required error={errors.fullname?.message}>
        <Input id="reg-fullname" autoComplete="name" placeholder="Nombre y apellido" {...register('fullname')} />
      </FormField>

      <FormField label="Correo" hint="Opcional" error={errors.email?.message}>
        <Input id="reg-email" type="email" autoComplete="email" inputMode="email" placeholder="correo@ejemplo.com" {...register('email')} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Contraseña" required error={errors.password?.message}>
          <PasswordInput id="reg-password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" {...register('password')} />
        </FormField>
        <FormField label="Confirmar contraseña" required error={errors.confirmPassword?.message}>
          <PasswordInput id="reg-confirm" autoComplete="new-password" placeholder="Repite la contraseña" {...register('confirmPassword')} />
        </FormField>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting} leftIcon={<UserPlus />}>
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-fg-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/ingresar" className="font-semibold text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
