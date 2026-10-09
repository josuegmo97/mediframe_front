import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, PauseCircle, PlayCircle, X } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { PauseLicenseDialog } from '@/features/licenses/components/pause-license-dialog'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { filterLicenses } from '@/features/licenses/licenses.utils'
import { DEFAULT_PAGE_SIZE, LICENSE_STATUS } from '@/lib/constants'
import { deviceLabel } from '@/lib/device-description'
import { formatDate, formatDateTime, formatNumber, formatRelative } from '@/lib/format'
import { formatLicenseCode, licenseDaysRemaining } from '@/lib/license-code'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

const byPausedAtDesc = (a, b) => new Date(b.paused_at ?? 0) - new Date(a.paused_at ?? 0)

function PausedSince({ license }) {
  if (!license.paused_at) return <span className="text-fg-subtle">—</span>
  return (
    <span className="text-fg-muted" title={formatDateTime(license.paused_at)}>
      {formatRelative(license.paused_at)}
    </span>
  )
}

function ResumeButton({ license, onResume }) {
  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={<PlayCircle />}
      onClick={(event) => {
        event.stopPropagation()
        onResume(license)
      }}
    >
      Reanudar
    </Button>
  )
}

function PausedLicenseCard({ license, onResume }) {
  const days = licenseDaysRemaining(license)
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/licencias/${license._id}`} className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <p className="font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
        </Link>
        <ResumeButton license={license} onResume={onResume} />
      </div>
      <p className="mt-2 text-xs text-fg-subtle">
        En pausa <PausedSince license={license} />
        {days != null && <> · vence en {days} d ({formatDate(license.expired_at)})</>}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-fg-subtle">Propietario</dt>
          <dd className="truncate text-fg">{license.owner_name || '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-fg-subtle">Dispositivo</dt>
          <dd className="truncate text-fg">{deviceLabel(license.device_description, license.device) || '—'}</dd>
        </div>
      </dl>
    </article>
  )
}

export default function PausedLicensesPage() {
  useDocumentTitle('Licencias en pausa')
  const navigate = useNavigate()
  const query = useLicensesQuery()
  const licenses = query.data ?? EMPTY
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [resuming, setResuming] = useState(null)

  const paused = useMemo(() => filterLicenses(licenses, { estado: 'pausada' }).sort(byPausedAtDesc), [licenses])
  const filtered = useMemo(() => filterLicenses(paused, { q: filters.q }), [paused, filters.q])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

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
    { key: 'owner', header: 'Propietario', hideBelow: 'md', cell: (license) => <span className="block max-w-[14rem] truncate text-fg-muted">{license.owner_name || '—'}</span> },
    { key: 'device', header: 'Dispositivo', hideBelow: 'lg', cell: (license) => <span className="block max-w-[16rem] truncate text-fg-muted">{deviceLabel(license.device_description, license.device ?? '—')}</span> },
    { key: 'paused', header: 'En pausa desde', cell: (license) => <PausedSince license={license} /> },
    {
      key: 'expires',
      header: 'Vence',
      hideBelow: 'lg',
      cell: (license) => {
        const days = licenseDaysRemaining(license)
        return (
          <span className="text-fg-muted">
            {formatDate(license.expired_at)}
            {days != null && <span className="ml-1 text-xs text-fg-subtle">({days} d)</span>}
          </span>
        )
      },
    },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', cell: (license) => <ResumeButton license={license} onResume={setResuming} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licencias en pausa"
        description="Licencias en uso pausadas por un administrador. En la app el usuario ve “cuenta en mantenimiento” y no puede crear pacientes ni estudios; los días siguen corriendo."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(paused.length)}</span>}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/licencias?estado=${LICENSE_STATUS.IN_USE}`}>
              <KeyRound />
              Pausar una licencia
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Código, propietario, correo, dispositivo…" aria-label="Buscar licencias en pausa" className="md:max-w-md" />
        {isDirty && (
          <Button variant="ghost" size="sm" onClick={reset} leftIcon={<X />}>
            Limpiar
          </Button>
        )}
        <div className="flex justify-end md:ml-auto">
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
            caption="Licencias en pausa"
            onRowClick={(license) => navigate(`/licencias/${license._id}`)}
            renderCard={(license) => <PausedLicenseCard license={license} onResume={setResuming} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={PauseCircle} title="Sin resultados" description="Ninguna licencia en pausa coincide con la búsqueda." action={<Button variant="outline" onClick={reset}>Limpiar búsqueda</Button>} />
              ) : (
                <EmptyState icon={PauseCircle} title="No hay licencias en pausa" description="Puedes pausar una licencia en uso desde su detalle, en la tarjeta “Control de acceso”." />
              )
            }
          />
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="licencias" />
        </>
      )}

      {resuming && <PauseLicenseDialog license={resuming} open onOpenChange={(open) => !open && setResuming(null)} />}
    </div>
  )
}
