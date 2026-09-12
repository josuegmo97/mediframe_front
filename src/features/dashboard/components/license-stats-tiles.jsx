import { CheckCircle2, KeyRound, MonitorCheck, XCircle } from 'lucide-react'
import { StatTile } from '@/components/ui/stat-tile'
import { formatNumber } from '@/lib/format'

export function LicenseStatsTiles({ stats, loading }) {
  const avg = stats?.avgDaysPermission ? Math.round(stats.avgDaysPermission) : null
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Licencias" value={stats?.total} icon={KeyRound} tone="accent" loading={loading} to="/licencias" hint={avg ? `Promedio ${formatNumber(avg)} días` : undefined} />
      <StatTile label="Disponibles" value={stats?.available} icon={CheckCircle2} tone="success" loading={loading} to="/licencias?estado=1" />
      <StatTile label="En uso" value={stats?.inUse} icon={MonitorCheck} tone="info" loading={loading} to="/licencias?estado=2" />
      <StatTile label="Expiradas" value={stats?.expired} icon={XCircle} tone="danger" loading={loading} to="/licencias?estado=3" />
    </div>
  )
}
