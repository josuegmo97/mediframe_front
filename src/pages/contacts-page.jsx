import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, Contact as ContactIcon, Download, Inbox } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
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
import { ContactCard } from '@/features/contacts/components/contact-card'
import { ContactDetailSheet } from '@/features/contacts/components/contact-detail-sheet'
import { ContactStatusBadge } from '@/features/contacts/components/contact-status-badge'
import { ContactStatusButton } from '@/features/contacts/components/contact-status-button'
import { ContactsFilters } from '@/features/contacts/components/contacts-filters'
import { useContactsQuery } from '@/features/contacts/contacts.queries'
import { contactsToCsv, countContacts, filterContacts } from '@/features/contacts/contacts.utils'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import { toast } from '@/lib/toast'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', estado: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function ContactsPage() {
  useDocumentTitle('Contactos')
  const query = useContactsQuery()
  const contacts = query.data ?? EMPTY
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [selectedId, setSelectedId] = useState(null)

  const counts = useMemo(() => countContacts(contacts), [contacts])
  const filtered = useMemo(() => filterContacts(contacts, filters), [contacts, filters])
  const selected = useMemo(() => contacts.find((c) => c._id === selectedId) ?? null, [contacts, selectedId])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay contactos para exportar')
    downloadCsv(timestampedFilename('contactos'), contactsToCsv(filtered))
    toast.success(`Exportados ${filtered.length} contactos`)
  }

  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      width: 130,
      cell: (c) => (
        <span className="text-fg-muted" title={formatDateTime(c.created_at)}>
          {formatDate(c.created_at)}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Contacto',
      cell: (c) => (
        <div className="min-w-0 max-w-[16rem]">
          <p className="truncate font-medium text-fg">{c.name}</p>
          <p className="truncate text-xs text-fg-muted">{[c.specialty, c.institution].filter(Boolean).join(' · ') || '—'}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Correo',
      hideBelow: 'lg',
      cell: (c) => (
        <a href={`mailto:${c.email}`} className="text-primary underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
          {c.email}
        </a>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      hideBelow: 'xl',
      cell: (c) =>
        c.phone ? (
          <a href={`tel:${c.phone}`} className="text-fg-muted hover:text-fg" onClick={(e) => e.stopPropagation()}>
            {c.phone}
          </a>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    { key: 'status', header: 'Estado', cell: (c) => <ContactStatusBadge status={c.status} /> },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', cell: (c) => <ContactStatusButton contact={c} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contactos"
        description="Solicitudes recibidas desde el formulario de la web de MediFrame."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(contacts.length)}</span>}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
            Exportar CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Pendientes" value={counts.pending} icon={Inbox} tone={counts.pending ? 'warning' : 'neutral'} loading={query.isPending} onClick={() => setFilter('estado', filters.estado === '0' ? '' : '0')} active={filters.estado === '0'} />
        <StatTile label="Contactados" value={counts.contacted} icon={CheckCircle2} tone="success" loading={query.isPending} onClick={() => setFilter('estado', filters.estado === '1' ? '' : '1')} active={filters.estado === '1'} />
      </div>

      <div className="flex flex-col gap-3">
        <ContactsFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} resultCount={filtered.length} />
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
            caption="Contactos recibidos desde la web"
            onRowClick={(c) => setSelectedId(c._id)}
            renderCard={(c) => <ContactCard contact={c} onOpen={(contact) => setSelectedId(contact._id)} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={ContactIcon} title="Sin resultados" description="Ningún contacto coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
              ) : (
                <EmptyState icon={ContactIcon} title="Aún no hay contactos" description="Las solicitudes del formulario web aparecerán aquí." />
              )
            }
          />
          <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="contactos" />
        </>
      )}

      <ContactDetailSheet contact={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  )
}
