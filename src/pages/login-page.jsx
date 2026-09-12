import { useDocumentTitle } from '@/hooks/use-document-title'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { LoginForm } from '@/features/auth/components/login-form'

export default function LoginPage() {
  useDocumentTitle('Ingresar')
  return (
    <AuthLayout title="Iniciar sesión" description="Accede con tu usuario del panel de MediFrame.">
      <LoginForm />
    </AuthLayout>
  )
}
