import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, MonitorSmartphone } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { UsageCard } from '@/features/usage/components/usage-card'
import { UsageFilters } from '@/features/usage/components/usage-filters'
import { UsageStatTiles } from '@/features/usage/components/usage-stat-tiles'
import { useUsageQuery } from '@/features/usage/usage.queries'
import { distinctVersions, filterUsage, installationLabel, usageToCsv } from '@/features/usage/usage.utils'
import { DEFAULT_PAGE_SIZE, USAGE_TRIGGER_LABEL } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { formatDateTime, formatNumber, formatRelative, shortId } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'
import { toast } from '@/lib/toast'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', licencia: '', version: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function InstallationsPage() {
  useDocumentTitle('Instalaciones')
  const navigate = useNavigate()
  const query = useUsageQuery()
  const items = query.data?.items ?? EMPTY
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)

  const versions = useMemo(() => distinctVersions(items), [items])
  const filtered = useMemo(() => filterUsage(items, filters), [items, filters])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay instalaciones para exportar')
    downloadCsv(timestampedFilename('instalaciones'), usageToCsv(filtered))
    toast.success(`Exportadas ${filtered.length} instalaciones`)
  }

  const numeric = (key) => ({ key, header: { patients: 'Pacientes', histories: 'Historias', users: 'Usuarios', pdf: 'PDF' }[key], align: 'right', hideBelow: key === 'users' ? 'xl' : undefined, cell: (item) => <span className="tabular-nums text-fg">{formatNumber(item[key])}</span> })

  const columns = [
    {
      key: 'device',
      header: 'Instalación',
      cell: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{installationLabel(item)}</p>
          <p className="truncate font-mono text-xs text-fg-subtle">{shortId(item.device_id, 18)}</p>
        </div>
      ),
    },
    {
      key: 'license',
      header: 'Licencia',
      hideBelow: 'md',
      cell: (item) =>
        item.license ? (
          <div className="min-w-0">
            <p className="truncate text-fg">{item.license.owner_name || 'Sin nombre'}</p>
            <p className="truncate font-mono text-xs text-fg-subtle">{formatLicenseCode(item.license.code)}</p>
          </div>
        ) : (
          <Badge variant="warning" dot>
            Sin licencia
          </Badge>
        ),
    },
    { key: 'version', header: 'Versión', cell: (item) => <Badge variant="outline">v{item.version}</Badge> },
    numeric('patients'),
    numeric('histories'),
    numeric('users'),
    numeric('pdf'),
    {
      key: 'sync',
      header: 'Último sync',
      hideBelow: 'lg',
      cell: (item) => (
        <div className="min-w-0">
          <p className="text-fg-muted" title={formatDateTime(item.received_at)}>
            {formatRelative(item.received_at)}
          </p>
          <p className="text-xs text-fg-subtle">{USAGE_TRIGGER_LABEL[item.trigger] ?? item.trigger}</p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instalaciones"
        description="Telemetría que envía cada Mac con MediFrame: contadores acumulados y última sincronización."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(items.length)}</span>}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
            Exportar CSV
          </Button>
        }
      />

      <UsageStatTiles stats={query.data?.stats} loading={query.isPending} />

      <div className="flex flex-col gap-3">
        <UsageFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} versions={versions} resultCount={filtered.length} />
        <div className="flex justify-end">
          <DataFreshness updatedAt={query.dataUpdatedAt} isFetching={query.isFetching} onRefresh={() => query.refetch()} />
        </div>
      </div>

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && query.data && <Alert variant="warning">No se pudo actualizar la lista. Mostrando datos guardados.</Alert>}
          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(item) => item.device_id}
            loading={query.isPending}
            caption="Instalaciones de MediFrame con telemetría"
            onRowClick={(item) => navigate(`/instalaciones/${encodeURIComponent(item.device_id)}`)}
            renderCard={(item) => <UsageCard item={item} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={MonitorSmartphone} title="Sin resultados" description="Ninguna instalación coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
              ) : (
                <EmptyState icon={MonitorSmartphone} title="Aún no hay telemetría" description="Las instalaciones aparecerán aquí cuando la app sincronice sus contadores." />
              )
            }
          />
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="instalaciones" />
        </>
      )}
    </div>
  )
}
