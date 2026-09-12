import { ShieldCheck, UserCheck, UserPlus, Users } from 'lucide-react'
import { StatTile } from '@/components/ui/stat-tile'

export function UserStatsTiles({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Usuarios" value={stats?.total} icon={Users} tone="accent" loading={loading} to="/usuarios" />
      <StatTile label="Activos" value={stats?.active} icon={UserCheck} tone="success" loading={loading} to="/usuarios?estado=1" />
      <StatTile label="Pendientes" value={stats?.inactive} icon={UserPlus} tone={stats?.inactive ? 'warning' : 'neutral'} loading={loading} to="/usuarios?estado=0" />
      <StatTile label="Administradores" value={stats?.admins} icon={ShieldCheck} tone="info" loading={loading} to="/usuarios?rol=1" />
    </div>
  )
}
