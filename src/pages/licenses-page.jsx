import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, KeyRound, Plus } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { CreateLicenseDialog } from '@/features/licenses/components/create-license-dialog'
import { LicenseCard } from '@/features/licenses/components/license-card'
import { LicenseCodesResultDialog } from '@/features/licenses/components/license-codes-result-dialog'
import { LicenseRowActions } from '@/features/licenses/components/license-row-actions'
import { LicenseStatTiles } from '@/features/licenses/components/license-stat-tiles'
import { LicenseStatusBadge } from '@/features/licenses/components/license-status-badge'
import { LicensesFilters } from '@/features/licenses/components/licenses-filters'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { computeStats, distinctDays, filterLicenses, licensesToCsv } from '@/features/licenses/licenses.utils'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { deviceLabel } from '@/lib/device-description'
import { formatDate, formatNumber, formatRelative } from '@/lib/format'
import { formatLicenseCode, licenseDaysRemaining } from '@/lib/license-code'
import { toast } from '@/lib/toast'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', estado: '', dias: '', pronto: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function LicensesPage() {
  useDocumentTitle('Licencias')
  const navigate = useNavigate()
  const query = useLicensesQuery()
  const licenses = query.data ?? EMPTY
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [createOpen, setCreateOpen] = useState(false)
  const [result, setResult] = useState(null)

  const stats = useMemo(() => computeStats(licenses), [licenses])
  const days = useMemo(() => distinctDays(licenses), [licenses])
  const filtered = useMemo(() => filterLicenses(licenses, filters), [licenses, filters])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay licencias para exportar')
    downloadCsv(timestampedFilename('licencias'), licensesToCsv(filtered))
    toast.success(`Exportadas ${filtered.length} licencias`)
  }

  const columns = [
    {
      key: 'code',
      header: 'Código',
      cell: (license) => (
        <span className="flex items-center gap-1">
          <span className="font-mono tracking-wider text-fg">{formatLicenseCode(license.code)}</span>
          <CopyButton value={formatLicenseCode(license.code)} label="Copiar código" className="-my-2 text-fg-subtle" />
        </span>
      ),
    },
    { key: 'status', header: 'Estado', cell: (license) => <LicenseStatusBadge license={license} /> },
    { key: 'owner', header: 'Propietario', hideBelow: 'md', cell: (license) => <span className="block max-w-[14rem] truncate text-fg-muted">{license.owner_name || '—'}</span> },
    { key: 'device', header: 'Dispositivo', hideBelow: 'lg', cell: (license) => <span className="block max-w-[16rem] truncate text-fg-muted">{deviceLabel(license.device_description, license.device ?? '—')}</span> },
    { key: 'days', header: 'Días', align: 'right', cell: (license) => <span className="tabular-nums text-fg-muted">{license.days_permission}</span> },
    {
      key: 'expires',
      header: 'Vence',
      hideBelow: 'lg',
      cell: (license) => {
        const days = licenseDaysRemaining(license)
        if (!license.expired_at) return <span className="text-fg-subtle">—</span>
        return (
          <span className="text-fg-muted" title={formatRelative(license.expired_at)}>
            {formatDate(license.expired_at)}
            {days != null && <span className="ml-1 text-xs text-fg-subtle">({days} d)</span>}
          </span>
        )
      },
    },
    { key: 'created', header: 'Creada', hideBelow: 'xl', cell: (license) => <span className="text-fg-muted">{formatDate(license.created_at)}</span> },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', width: 56, cell: (license) => <LicenseRowActions license={license} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licencias"
        description="Códigos de activación de MediFrame. Cada licencia se vincula a una Mac al activarse."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(licenses.length)}</span>}
        actions={
          <>
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
              Exportar CSV
            </Button>
            <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus />}>
              Nueva licencia
            </Button>
          </>
        }
      />

      <LicenseStatTiles stats={stats} loading={query.isPending} activeStatus={filters.estado} onSelectStatus={(value) => setFilter('estado', value)} />

      <div className="flex flex-col gap-3">
        <LicensesFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} days={days} resultCount={filtered.length} />
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
            caption="Listado de licencias"
            onRowClick={(license) => navigate(`/licencias/${license._id}`)}
            renderCard={(license) => <LicenseCard license={license} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={KeyRound} title="Sin resultados" description="Ninguna licencia coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
              ) : (
                <EmptyState icon={KeyRound} title="Aún no hay licencias" description="Crea la primera licencia para entregar a un cliente." action={<Button onClick={() => setCreateOpen(true)} leftIcon={<Plus />}>Nueva licencia</Button>} />
              )
            }
          />
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="licencias" />
        </>
      )}

      <CreateLicenseDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={setResult} />
      <LicenseCodesResultDialog result={result} open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)} />
    </div>
  )
}
