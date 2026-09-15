import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { reasonLabel, stateMeta } from '../voice-reports.utils'

/** Estado efectivo que ve la app, con el motivo en tooltip cuando no está disponible. */
export function VoiceReportStateBadge({ state, reasonCode, showReason = false }) {
  const meta = stateMeta(state)
  const reason = reasonLabel(reasonCode)
  const badge = (
    <Badge variant={meta.tone} dot>
      {meta.label}
    </Badge>
  )
  if (showReason && reason) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {badge}
        <span className="text-xs text-fg-subtle">{reason}</span>
      </span>
    )
  }
  return reason ? <Tooltip content={reason}>{badge}</Tooltip> : badge
}
