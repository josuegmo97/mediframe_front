import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { ErrorState } from '@/components/ui/error-state'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAuth } from '@/features/auth/auth-provider'
import { deviceModels, licensesPerMonth, recentSyncs, statusDistribution, versionsInUse } from '@/features/dashboard/analytics'
import { ExpiringLicensesCard } from '@/features/dashboard/components/expiring-licenses-card'
import { HorizontalBarsChart } from '@/features/dashboard/components/horizontal-bars-chart'
import { LicenseStatsTiles } from '@/features/dashboard/components/license-stats-tiles'
import { LicenseStatusChart } from '@/features/dashboard/components/license-status-chart'
import { LicensesPerMonthChart } from '@/features/dashboard/components/licenses-per-month-chart'
import { RecentSyncsCard } from '@/features/dashboard/components/recent-syncs-card'
import { UserStatsTiles } from '@/features/dashboard/components/user-stats-tiles'
import { WelcomeBanner } from '@/features/dashboard/components/welcome-banner'
import { useLicenseStatsQuery, useLicensesQuery } from '@/features/licenses/licenses.queries'
import { AccountSummaryCard } from '@/features/profile/components/account-summary-card'
import { UsageStatTiles } from '@/features/usage/components/usage-stat-tiles'
import { useUsageQuery } from '@/features/usage/usage.queries'
import { useUserStatsQuery } from '@/features/users/users.queries'
import { VoiceReportStatTiles } from '@/features/voice-reports/components/voice-report-stat-tiles'
import { useVoiceReportDevicesQuery } from '@/features/voice-reports/voice-reports.queries'

const EMPTY = []

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">{children}</h2>
      {action}
    </div>
  )
}

function ViewerDashboard({ user }) {
  return (
    <div className="space-y-6">
      <WelcomeBanner user={user} />
      <Alert variant="info" title="Cuenta de espectador" icon={Eye}>
        Tu cuenta puede ver y editar su propio perfil. Para gestionar usuarios, licencias o instalaciones, pide a un administrador que amplíe tus permisos.
      </Alert>
      <AccountSummaryCard user={user} />
      <Button asChild variant="outline">
        <Link to="/perfil">
          Ir a mi perfil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

function AdminDashboard({ user }) {
  const userStats = useUserStatsQuery()
  const licenseStats = useLicenseStatsQuery()
  const licensesQuery = useLicensesQuery()
  const usageQuery = useUsageQuery()
  const voiceQuery = useVoiceReportDevicesQuery()

  const licenses = licensesQuery.data ?? EMPTY
  const usageItems = usageQuery.data?.items ?? EMPTY

  const perMonth = useMemo(() => licensesPerMonth(licenses), [licenses])
  const distribution = useMemo(() => statusDistribution(licenses), [licenses])
  const versions = useMemo(() => versionsInUse(usageItems, licenses), [usageItems, licenses])
  const models = useMemo(() => deviceModels(licenses), [licenses])
  const syncs = useMemo(() => recentSyncs(usageItems, 6), [usageItems])

  const pendingUsers = userStats.data?.inactive ?? 0
  const allFailed = [userStats, licenseStats, licensesQuery, usageQuery].every((q) => q.isError && !q.data)
  const lastUpdated = Math.max(licensesQuery.dataUpdatedAt || 0, licenseStats.dataUpdatedAt || 0, usageQuery.dataUpdatedAt || 0) || undefined
  const isFetching = licensesQuery.isFetching || licenseStats.isFetching || usageQuery.isFetching || userStats.isFetching || voiceQuery.isFetching
  const refreshAll = () => {
    userStats.refetch()
    licenseStats.refetch()
    licensesQuery.refetch()
    usageQuery.refetch()
    voiceQuery.refetch()
  }

  if (allFailed) {
    return (
      <div className="space-y-6">
        <WelcomeBanner user={user} />
        <ErrorState error={licensesQuery.error} onRetry={refreshAll} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <WelcomeBanner user={user}>
        <DataFreshness updatedAt={lastUpdated} isFetching={isFetching} onRefresh={refreshAll} />
      </WelcomeBanner>

      {pendingUsers > 0 && (
        <Alert
          variant="warning"
          title={`${pendingUsers} ${pendingUsers === 1 ? 'usuario pendiente' : 'usuarios pendientes'} de activación`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/usuarios?estado=0">Revisar</Link>
            </Button>
          }
        >
          Los registros nuevos no pueden ingresar hasta que los actives.
        </Alert>
      )}

      <section className="space-y-3">
        <SectionTitle>Licencias</SectionTitle>
        <LicenseStatsTiles stats={licenseStats.data?.stats} loading={licenseStats.isPending} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LicensesPerMonthChart data={perMonth} loading={licensesQuery.isPending} />
        </div>
        <LicenseStatusChart data={distribution} loading={licensesQuery.isPending} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ExpiringLicensesCard expiring={licenseStats.data?.expiringLicenses} licenses={licenses} loading={licenseStats.isPending} />
        <RecentSyncsCard items={syncs} loading={usageQuery.isPending} />
      </section>

      <section className="space-y-3">
        <SectionTitle
          action={
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link to="/instalaciones">Ver instalaciones</Link>
            </Button>
          }
        >
          Telemetría
        </SectionTitle>
        <UsageStatTiles stats={usageQuery.data?.stats} loading={usageQuery.isPending} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <HorizontalBarsChart title="Versiones de la app en uso" description="Instalaciones por versión reportada" data={versions} loading={usageQuery.isPending && licensesQuery.isPending} emptyDescription="Sin instalaciones activas todavía." seriesName="Instalaciones" rowLabel="Versión" />
        <HorizontalBarsChart title="Equipos" description="Modelos de Mac con licencia activada" data={models} loading={licensesQuery.isPending} emptyDescription="Aún no hay licencias activadas." seriesName="Licencias" rowLabel="Modelo" />
      </section>

      {(voiceQuery.isPending || voiceQuery.data) && (
        <section className="space-y-3">
          <SectionTitle
            action={
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link to="/dictado">Ver dictado por voz</Link>
              </Button>
            }
          >
            Dictado por voz
          </SectionTitle>
          <VoiceReportStatTiles stats={voiceQuery.data?.stats} period={voiceQuery.data?.period} loading={voiceQuery.isPending} />
        </section>
      )}

      <section className="space-y-3">
        <SectionTitle
          action={
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link to="/usuarios">Ver usuarios</Link>
            </Button>
          }
        >
          Usuarios del panel
        </SectionTitle>
        <UserStatsTiles stats={userStats.data} loading={userStats.isPending} />
      </section>
    </div>
  )
}

export default function DashboardPage() {
  useDocumentTitle('Inicio')
  const { user, isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard user={user} /> : <ViewerDashboard user={user} />
}
