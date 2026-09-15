import { AlertTriangle, DollarSign, Mic, MonitorSmartphone, Users } from 'lucide-react'
import { StatTile } from '@/components/ui/stat-tile'
import { VOICE_REPORT_PERIOD_LABEL } from '@/lib/constants'
import { formatUsd, formatUtcDate } from '@/lib/format'

/** Resumen del período actual. `basePath` permite enlazar los tiles desde Inicio. */
export function VoiceReportStatTiles({ stats, period, loading, basePath = '/dictado' }) {
  const totals = stats?.totals ?? {}
  const periodHint = period ? `${VOICE_REPORT_PERIOD_LABEL[period.name] ?? period.name} · desde ${formatUtcDate(period.start, 'd MMM')}` : undefined
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatTile
        label="Dispositivos"
        value={stats?.total}
        icon={MonitorSmartphone}
        tone="accent"
        loading={loading}
        to={basePath}
        hint={stats ? `${stats.available} listos · ${stats.blocked} bloqueados` : undefined}
        className="col-span-2 md:col-span-1"
      />
      <StatTile label="Dictados" value={totals.success} icon={Mic} tone="success" loading={loading} hint={periodHint} />
      <StatTile label="Errores" value={totals.errors} icon={AlertTriangle} tone={totals.errors ? 'danger' : 'neutral'} loading={loading} />
      <StatTile label="Costo del período" value={loading ? undefined : formatUsd(totals.cost_usd)} icon={DollarSign} tone="warning" loading={loading} hint="Estimado con las tarifas de DeepSeek" />
      <StatTile label="Usuarios distintos" value={totals.distinct_users} icon={Users} tone="info" loading={loading} hint={totals.sessions != null ? `${totals.sessions} sesiones` : undefined} />
    </div>
  )
}
