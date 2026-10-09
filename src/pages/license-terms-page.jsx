import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Eye, FileCheck2, FileText, KeyRound, MoreHorizontal, RefreshCw, Users, X, XCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataFreshness } from '@/components/ui/data-freshness'
import { DataTable } from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Segmented } from '@/components/ui/segmented'
import { Select } from '@/components/ui/select'
import { StatTile } from '@/components/ui/stat-tile'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { TermsRequestDialog } from '@/features/licenses/components/terms-request-dialog'
import { TermsTextDialog } from '@/features/licenses/components/terms-text-dialog'
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { computeTermsStats, currentTermsAcceptances, filterTermsLicenses, termsAcceptanceRows } from '@/features/licenses/licenses.utils'
import { DEFAULT_PAGE_SIZE, LICENSE_STATUS } from '@/lib/constants'
import { formatDateTime, formatRelative } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'

const EMPTY = []

const FILTER_DEFAULTS = { vista: 'licencias', q: '', estado: '', tipo: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

function When({ value }) {
  if (!value) return <span className="text-fg-subtle">—</span>
  return (
    <span className="text-fg-muted" title={formatDateTime(value)}>
      {formatRelative(value)}
    </span>
  )
}

function AcceptanceCountBadge({ license }) {
  const count = currentTermsAcceptances(license).length
  if (count === 0) return <Badge variant="warning" dot>Sin aceptar</Badge>
  return (
    <Badge variant="success" dot>
      {count} {count === 1 ? 'aceptación' : 'aceptaciones'}
    </Badge>
  )
}

function lastAcceptedAt(license) {
  const dates = currentTermsAcceptances(license).map((item) => new Date(item.accepted_at).getTime()).filter(Number.isFinite)
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null
}

function UserTypeBadge({ isSubUser }) {
  return isSubUser ? <Badge variant="neutral">Sub-usuario</Badge> : <Badge variant="info">Titular</Badge>
}

function TermsRowActions({ license, onAction }) {
  const navigate = useNavigate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Acciones para la licencia ${formatLicenseCode(license.code)}`} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem icon={<Eye />} onSelect={() => navigate(`/licencias/${license._id}`)}>
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem icon={<RefreshCw />} onSelect={() => onAction(license, 'request')}>
          Volver a solicitar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive icon={<XCircle />} onSelect={() => onAction(license, 'cancel')}>
          Cancelar solicitud
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TermsLicenseCard({ license, onAction }) {
  const acceptances = currentTermsAcceptances(license)
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/licencias/${license._id}`} className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <p className="font-mono text-base tracking-wider text-fg">{formatLicenseCode(license.code)}</p>
          <p className="truncate text-sm text-fg-muted">{license.owner_name || 'Sin propietario'}</p>
        </Link>
        <TermsRowActions license={license} onAction={onAction} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <AcceptanceCountBadge license={license} />
        <span className="text-xs text-fg-subtle">
          Solicitada <When value={license.terms_requested_at} />
        </span>
      </div>
      {acceptances.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          {acceptances.map((item, index) => (
            <li key={`${item.accepted_at}-${index}`} className="flex items-center justify-between gap-2">
              <span className="truncate text-fg">{item.user_name || 'Usuario sin nombre'}</span>
              <span className="shrink-0 text-xs text-fg-subtle">{formatDateTime(item.accepted_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function AcceptanceCard({ row }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate font-medium text-fg">{row.user_name || 'Usuario sin nombre'}</p>
        <UserTypeBadge isSubUser={row.is_sub_user} />
      </div>
      <p className="mt-1 text-xs text-fg-subtle">{formatDateTime(row.accepted_at)}</p>
      <Link to={`/licencias/${row.license._id}`} className="mt-2 block font-mono text-sm tracking-wider text-fg-muted hover:text-fg">
        {formatLicenseCode(row.license.code)}
      </Link>
    </article>
  )
}

export default function LicenseTermsPage() {
  useDocumentTitle('Términos y condiciones')
  const navigate = useNavigate()
  const query = useLicensesQuery()
  const licenses = query.data ?? EMPTY
  const { filters, setFilter, setFilters, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [action, setAction] = useState({ license: null, mode: null })
  const [textOpen, setTextOpen] = useState(false)
  const byAcceptance = filters.vista === 'aceptaciones'

  const stats = useMemo(() => computeTermsStats(licenses), [licenses])
  const requestRows = useMemo(() => filterTermsLicenses(licenses, filters), [licenses, filters])
  const acceptanceRows = useMemo(() => termsAcceptanceRows(licenses, filters), [licenses, filters])
  const rows = byAcceptance ? acceptanceRows : requestRows
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: rows, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })
  const filtersDirty = isDirty && (filters.q !== '' || filters.estado !== '' || filters.tipo !== '')

  const openAction = useCallback((license, mode) => setAction({ license, mode }), [])
  const showRequests = (estado) => setFilters({ vista: 'licencias', estado, tipo: '' })

  const requestColumns = [
    { key: 'code', header: 'Código', cell: (license) => <span className="font-mono tracking-wider text-fg">{formatLicenseCode(license.code)}</span> },
    { key: 'owner', header: 'Propietario', hideBelow: 'md', cell: (license) => <span className="block max-w-[14rem] truncate text-fg-muted">{license.owner_name || '—'}</span> },
    { key: 'requested', header: 'Solicitada', cell: (license) => <When value={license.terms_requested_at} /> },
    { key: 'acceptances', header: 'Aceptaciones', cell: (license) => <AcceptanceCountBadge license={license} /> },
    { key: 'last', header: 'Última aceptación', hideBelow: 'lg', cell: (license) => <When value={lastAcceptedAt(license)} /> },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', width: 56, cell: (license) => <TermsRowActions license={license} onAction={openAction} /> },
  ]

  const acceptanceColumns = [
    { key: 'user', header: 'Usuario', cell: (row) => <span className="block max-w-[16rem] truncate text-fg">{row.user_name || 'Usuario sin nombre'}</span> },
    { key: 'type', header: 'Tipo', cell: (row) => <UserTypeBadge isSubUser={row.is_sub_user} /> },
    { key: 'code', header: 'Licencia', cell: (row) => <span className="font-mono tracking-wider text-fg-muted">{formatLicenseCode(row.license.code)}</span> },
    { key: 'owner', header: 'Propietario', hideBelow: 'lg', cell: (row) => <span className="block max-w-[14rem] truncate text-fg-muted">{row.license.owner_name || '—'}</span> },
    { key: 'accepted', header: 'Aceptó', cell: (row) => <span className="text-fg-muted">{formatDateTime(row.accepted_at)}</span> },
  ]

  const emptyState = filtersDirty ? (
    <EmptyState icon={FileCheck2} title="Sin resultados" description="Nada coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
  ) : byAcceptance ? (
    <EmptyState icon={Users} title="Aún no hay aceptaciones" description="Aparecerán aquí cuando los usuarios acepten los términos en la app." />
  ) : (
    <EmptyState icon={FileCheck2} title="No hay solicitudes de términos" description="Solicita la aceptación desde el detalle de una licencia en uso, en la tarjeta “Control de acceso”." />
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Términos y condiciones"
        description="Solicitudes de aceptación enviadas a las licencias y quién las aceptó. Cada usuario y sub-usuario debe aceptar en la app."
        actions={
          <>
            <Button variant="outline" onClick={() => setTextOpen(true)} leftIcon={<FileText />}>
              Ver términos
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/licencias?estado=${LICENSE_STATUS.IN_USE}`}>
                <KeyRound />
                Solicitar a una licencia
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Solicitudes vigentes" value={stats.requested} icon={FileCheck2} tone="accent" loading={query.isPending} onClick={() => showRequests('')} active={!byAcceptance && filters.estado === ''} />
        <StatTile label="Con aceptación" value={stats.accepted} icon={CheckCircle2} tone="success" loading={query.isPending} onClick={() => showRequests('aceptada')} active={!byAcceptance && filters.estado === 'aceptada'} />
        <StatTile label="Sin aceptar" value={stats.pending} icon={Clock3} tone="warning" loading={query.isPending} onClick={() => showRequests('pendiente')} active={!byAcceptance && filters.estado === 'pendiente'} />
        <StatTile label="Aceptaciones" value={stats.acceptances} icon={Users} tone="info" loading={query.isPending} onClick={() => setFilters({ vista: 'aceptaciones', estado: '' })} active={byAcceptance} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-[16rem_minmax(0,1fr)_12rem_auto] md:items-center">
          <Segmented
            label="Vista"
            value={filters.vista}
            onValueChange={(vista) => setFilters({ vista, estado: '', tipo: '' })}
            options={[
              { value: 'licencias', label: 'Por licencia' },
              { value: 'aceptaciones', label: 'Aceptaciones' },
            ]}
          />
          <SearchInput
            value={filters.q}
            onChange={(value) => setFilter('q', value)}
            placeholder={byAcceptance ? 'Usuario, código, propietario…' : 'Código, propietario, correo, dispositivo…'}
            aria-label="Buscar"
          />
          {byAcceptance ? (
            <Select
              aria-label="Filtrar por tipo de usuario"
              value={filters.tipo}
              onChange={(event) => setFilter('tipo', event.target.value)}
              options={[
                { value: '', label: 'Todos los usuarios' },
                { value: 'titular', label: 'Titulares' },
                { value: 'sub', label: 'Sub-usuarios' },
              ]}
            />
          ) : (
            <Select
              aria-label="Filtrar por estado"
              value={filters.estado}
              onChange={(event) => setFilter('estado', event.target.value)}
              options={[
                { value: '', label: 'Todas las solicitudes' },
                { value: 'pendiente', label: 'Sin aceptar' },
                { value: 'aceptada', label: 'Con aceptación' },
              ]}
            />
          )}
          <div className="flex items-center justify-end">
            {filtersDirty && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({ q: '', estado: '', tipo: '' })} leftIcon={<X />}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <DataFreshness updatedAt={query.dataUpdatedAt} isFetching={query.isFetching} onRefresh={() => query.refetch()} />
        </div>
      </div>

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && query.data && <Alert variant="warning">No se pudo actualizar la lista. Mostrando datos guardados.</Alert>}
          {byAcceptance ? (
            <DataTable
              key="aceptaciones"
              columns={acceptanceColumns}
              rows={pagination.pageItems}
              loading={query.isPending}
              caption="Aceptaciones de términos"
              onRowClick={(row) => navigate(`/licencias/${row.license._id}`)}
              renderCard={(row) => <AcceptanceCard row={row} />}
              emptyState={emptyState}
            />
          ) : (
            <DataTable
              key="licencias"
              columns={requestColumns}
              rows={pagination.pageItems}
              loading={query.isPending}
              caption="Solicitudes de términos por licencia"
              onRowClick={(license) => navigate(`/licencias/${license._id}`)}
              renderCard={(license) => <TermsLicenseCard license={license} onAction={openAction} />}
              emptyState={emptyState}
            />
          )}
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel={byAcceptance ? 'aceptaciones' : 'licencias'} />
        </>
      )}

      <TermsRequestDialog license={action.license} mode={action.mode} onClose={() => setAction({ license: null, mode: null })} />
      <TermsTextDialog open={textOpen} onOpenChange={setTextOpen} />
    </div>
  )
}
