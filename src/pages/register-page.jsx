import { useDocumentTitle } from '@/hooks/use-document-title'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { RegisterForm } from '@/features/auth/components/register-form'

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  return (
    <AuthLayout title="Crear cuenta" description="Solicita acceso al panel. Un administrador revisará tu cuenta.">
      <RegisterForm />
    </AuthLayout>
  )
}
