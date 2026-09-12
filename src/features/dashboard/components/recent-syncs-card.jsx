import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { installationLabel } from '@/features/usage/usage.utils'
import { USAGE_TRIGGER_LABEL } from '@/lib/constants'
import { formatRelative } from '@/lib/format'

export function RecentSyncsCard({ items, loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Actividad reciente</CardTitle>
          <CardDescription>Últimas sincronizaciones de telemetría.</CardDescription>
        </div>
        {items.length > 0 && (
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link to="/instalaciones">Ver todas</Link>
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
          <EmptyState compact icon={Activity} title="Sin actividad" description="Las instalaciones aún no han sincronizado datos." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.device_id}>
                <Link to={`/instalaciones/${encodeURIComponent(item.device_id)}`} className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{installationLabel(item)}</p>
                    <p className="truncate text-xs text-fg-muted">{item.license?.owner_name || 'Sin licencia'} · {USAGE_TRIGGER_LABEL[item.trigger] ?? item.trigger}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline">v{item.version}</Badge>
                    <p className="mt-1 text-xs text-fg-subtle">{formatRelative(item.received_at)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
