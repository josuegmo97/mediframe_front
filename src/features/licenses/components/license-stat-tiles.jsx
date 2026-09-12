import { CheckCircle2, KeyRound, MonitorCheck, XCircle } from 'lucide-react'
import { StatTile } from '@/components/ui/stat-tile'
import { LICENSE_STATUS } from '@/lib/constants'

/** Tiles de licencias que además actúan como filtro por estado. */
export function LicenseStatTiles({ stats, loading, activeStatus, onSelectStatus }) {
  const toggle = (status) => () => onSelectStatus(String(activeStatus) === String(status) ? '' : String(status))
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Total" value={stats?.total} icon={KeyRound} tone="accent" loading={loading} onClick={() => onSelectStatus('')} active={activeStatus === ''} />
      <StatTile label="Disponibles" value={stats?.available} icon={CheckCircle2} tone="success" loading={loading} onClick={toggle(LICENSE_STATUS.AVAILABLE)} active={String(activeStatus) === String(LICENSE_STATUS.AVAILABLE)} />
      <StatTile
        label="En uso"
        value={stats?.inUse}
        icon={MonitorCheck}
        tone="info"
        loading={loading}
        hint={stats?.expiringSoon ? `${stats.expiringSoon} vencen en 7 días` : undefined}
        onClick={toggle(LICENSE_STATUS.IN_USE)}
        active={String(activeStatus) === String(LICENSE_STATUS.IN_USE)}
      />
      <StatTile label="Expiradas" value={stats?.expired} icon={XCircle} tone="danger" loading={loading} onClick={toggle(LICENSE_STATUS.EXPIRED)} active={String(activeStatus) === String(LICENSE_STATUS.EXPIRED)} />
    </div>
  )
}
