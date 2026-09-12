import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, LifeBuoy } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { StatTile } from '@/components/ui/stat-tile'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { useAtcQuery } from '@/features/atc/atc.queries'
import { atcToCsv, countPending, distinctAtcVersions, filterAtc } from '@/features/atc/atc.utils'
import { AtcFilters } from '@/features/atc/components/atc-filters'
import { AtcMessageCard } from '@/features/atc/components/atc-message-card'
import { AtcRowActions } from '@/features/atc/components/atc-row-actions'
import { AtcStatusBadge } from '@/features/atc/components/atc-status-badge'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { deviceLabel, normalizeDeviceId } from '@/lib/device-description'
import { formatDateTime, formatNumber, formatRelative, shortId } from '@/lib/format'
import { toast } from '@/lib/toast'
import { CheckCircle2, Inbox } from 'lucide-react'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', dispositivo: '', version: '', estado: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function SupportPage() {
  useDocumentTitle('Soporte')
  const navigate = useNavigate()
  const query = useAtcQuery()
  const messages = query.data ?? EMPTY
  const licenses = useLicensesQuery({ enabled: false })
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)

  // Nombre legible del dispositivo a partir de las licencias en cache (sin peticiones extra)
  const deviceNames = useMemo(() => {
    const map = new Map()
    for (const license of licenses.data ?? []) {
      if (license.device) map.set(normalizeDeviceId(license.device), deviceLabel(license.device_description, null) ?? license.owner_name ?? null)
    }
    return map
  }, [licenses.data])
  const nameFor = (device) => deviceNames.get(normalizeDeviceId(device)) ?? null

  const versions = useMemo(() => distinctAtcVersions(messages), [messages])
  const filtered = useMemo(() => filterAtc(messages, filters), [messages, filters])
  const pending = useMemo(() => countPending(messages), [messages])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay mensajes para exportar')
    downloadCsv(timestampedFilename('soporte'), atcToCsv(filtered))
    toast.success(`Exportados ${filtered.length} mensajes`)
  }

  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      width: 150,
      cell: (m) => (
        <span className="text-fg-muted" title={formatDateTime(m.created_at)}>
          {formatRelative(m.created_at)}
        </span>
      ),
    },
    {
      key: 'device',
      header: 'Dispositivo',
      hideBelow: 'md',
      cell: (m) => (
        <div className="min-w-0 max-w-[14rem]">
          {nameFor(m.device) && <p className="truncate text-fg">{nameFor(m.device)}</p>}
          <p className="truncate font-mono text-xs text-fg-subtle">{shortId(m.device, 18)}</p>
        </div>
      ),
    },
    { key: 'version', header: 'Versión', hideBelow: 'lg', cell: (m) => <Badge variant="outline">v{m.version}</Badge> },
    { key: 'message', header: 'Mensaje', cell: (m) => <p className="line-clamp-2 max-w-xl text-fg">{m.message}</p> },
    { key: 'status', header: 'Estado', cell: (m) => <AtcStatusBadge status={m.status} /> },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', width: 56, cell: (m) => <AtcRowActions message={m} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soporte"
        description="Mensajes enviados desde la app de escritorio por los usuarios de MediFrame."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(messages.length)}</span>}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
            Exportar CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Pendientes" value={pending} icon={Inbox} tone={pending ? 'warning' : 'neutral'} loading={query.isPending} onClick={() => setFilter('estado', filters.estado === '0' ? '' : '0')} active={filters.estado === '0'} />
        <StatTile label="Atendidos" value={messages.length - pending} icon={CheckCircle2} tone="success" loading={query.isPending} onClick={() => setFilter('estado', filters.estado === '1' ? '' : '1')} active={filters.estado === '1'} />
      </div>

      <div className="flex flex-col gap-3">
        <AtcFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} versions={versions} resultCount={filtered.length} />
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
            loading={query.isPending}
            caption="Mensajes de soporte"
            onRowClick={(m) => navigate(`/soporte/${m._id}`)}
            renderCard={(m) => <AtcMessageCard message={m} deviceName={nameFor(m.device)} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={LifeBuoy} title="Sin resultados" description="Ningún mensaje coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
              ) : (
                <EmptyState icon={LifeBuoy} title="No hay mensajes de soporte" description="Cuando un usuario envíe un mensaje desde la app aparecerá aquí." />
              )
            }
          />
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="mensajes" />
        </>
      )}
    </div>
  )
}
