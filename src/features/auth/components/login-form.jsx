import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { normalizeApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { useAuth } from '../auth-provider'
import { loginSchema } from '../schemas'

export function LoginForm() {
  const { login } = useAuth()
  const location = useLocation()
  const registered = location.state?.registered
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: location.state?.username ?? '', password: '' },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      const user = await login({ username: values.username.trim().toLowerCase(), password: values.password })
      toast.success(`Hola, ${user.fullname}`, { id: 'login' })
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  const alertVariant = serverError?.code === 'LOGIN_004' ? 'warning' : 'danger'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {registered && !serverError && (
        <Alert variant="success" title="Cuenta creada">
          Un administrador debe activarla antes de que puedas ingresar.
        </Alert>
      )}

      {serverError && (
        <Alert variant={alertVariant} title={serverError.isRateLimited ? 'Demasiados intentos' : undefined}>
          {serverError.isRateLimited ? 'Por seguridad, espera 15 minutos antes de volver a intentarlo.' : serverError.message}
        </Alert>
      )}

      <FormField label="Usuario" error={errors.username?.message}>
        <Input id="login-username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="tu.usuario" {...register('username')} />
      </FormField>

      <FormField label="Contraseña" error={errors.password?.message}>
        <PasswordInput id="login-password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
      </FormField>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting} leftIcon={<LogIn />}>
        Ingresar
      </Button>

      <p className="text-center text-sm text-fg-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-primary underline-offset-4 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
