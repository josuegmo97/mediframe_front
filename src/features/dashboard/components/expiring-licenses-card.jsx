import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { deviceLabel } from '@/lib/device-description'
import { daysUntil, formatDate, shortId } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'

export function ExpiringLicensesCard({ expiring, licenses, loading }) {
  const byId = new Map((licenses ?? []).map((l) => [l._id, l]))
  // El endpoint de stats no incluye `status`, así que el virtual days_remaining llega null: se calcula desde expired_at
  const withDays = (expiring ?? []).map((item) => ({ ...item, days: item.days_remaining ?? Math.max(0, daysUntil(item.expired_at) ?? 0) }))
  const items = withDays.sort((a, b) => a.days - b.days)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Vencen en 7 días</CardTitle>
          <CardDescription>Licencias en uso próximas a expirar.</CardDescription>
        </div>
        {items.length > 0 && (
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link to="/licencias?pronto=1">Ver todas</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState compact icon={CalendarClock} title="Nada por vencer" description="Ninguna licencia vence en los próximos 7 días." />
        ) : (
          <ul className="divide-y divide-border">
            {items.slice(0, 6).map((item) => {
              const full = byId.get(item._id)
              const device = full ? deviceLabel(full.device_description, null) : null
              return (
                <li key={item._id}>
                  <Link to={`/licencias/${item._id}`} className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary">
                    <div className="min-w-0">
                      <p className="font-mono text-sm tracking-wider text-fg">{formatLicenseCode(item.code)}</p>
                      <p className="truncate text-xs text-fg-muted">{full?.owner_name || device || shortId(item.device, 13)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-warning-fg dark:text-warning">{item.days} d</p>
                      <p className="text-xs text-fg-subtle">{formatDate(item.expired_at)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
