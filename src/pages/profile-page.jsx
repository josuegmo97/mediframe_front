import { PageHeader } from '@/components/ui/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAuth } from '@/features/auth/auth-provider'
import { AccountSummaryCard } from '@/features/profile/components/account-summary-card'
import { PasswordForm } from '@/features/profile/components/password-form'
import { ProfileForm } from '@/features/profile/components/profile-form'

export default function ProfilePage() {
  useDocumentTitle('Mi perfil')
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader title="Mi perfil" description="Gestiona tus datos personales y tu contraseña." />
      <AccountSummaryCard user={user} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileForm user={user} />
        <PasswordForm />
      </div>
    </div>
  )
}
