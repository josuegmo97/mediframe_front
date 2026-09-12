import { FileText, FolderHeart, MonitorSmartphone, Stethoscope, Users } from 'lucide-react'
import { StatTile } from '@/components/ui/stat-tile'

export function UsageStatTiles({ stats, loading }) {
  const totals = stats?.totals ?? {}
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatTile
        label="Instalaciones"
        value={stats?.total}
        icon={MonitorSmartphone}
        tone="accent"
        loading={loading}
        hint={stats ? `${stats.withLicense} con licencia · ${stats.withoutLicense} sin licencia` : undefined}
        className="col-span-2 md:col-span-1"
      />
      <StatTile label="Pacientes" value={totals.patients} icon={Stethoscope} tone="info" loading={loading} />
      <StatTile label="Historias" value={totals.histories} icon={FolderHeart} tone="success" loading={loading} />
      <StatTile label="Usuarios de la app" value={totals.users} icon={Users} tone="neutral" loading={loading} />
      <StatTile label="PDF generados" value={totals.pdf} icon={FileText} tone="warning" loading={loading} />
    </div>
  )
}
