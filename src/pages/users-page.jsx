import { useCallback, useMemo, useState } from 'react'
import { Download, Plus, Users as UsersIcon } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useListFilters } from '@/hooks/use-list-filters'
import { usePagination } from '@/hooks/use-pagination'
import { RoleBadge, UserStatusBadge } from '@/features/users/components/user-badges'
import { UserCard } from '@/features/users/components/user-card'
import { UserFormDialog } from '@/features/users/components/user-form-dialog'
import { UserRowActions } from '@/features/users/components/user-row-actions'
import { UsersFilters } from '@/features/users/components/users-filters'
import { useUsersQuery } from '@/features/users/users.queries'
import { filterUsers, usersToCsv } from '@/features/users/users.utils'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { formatDate, formatNumber, formatRelative } from '@/lib/format'
import { toast } from '@/lib/toast'

const EMPTY = []

const FILTER_DEFAULTS = { q: '', estado: '', rol: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function UsersPage() {
  useDocumentTitle('Usuarios')
  const query = useUsersQuery()
  const users = query.data ?? EMPTY
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [dialog, setDialog] = useState({ open: false, user: null })

  const filtered = useMemo(() => filterUsers(users, filters), [users, filters])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const openCreate = () => setDialog({ open: true, user: null })
  const openEdit = (user) => setDialog({ open: true, user })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay usuarios para exportar')
    downloadCsv(timestampedFilename('usuarios'), usersToCsv(filtered))
    toast.success(`Exportados ${filtered.length} usuarios`)
  }

  const columns = [
    {
      key: 'user',
      header: 'Usuario',
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.fullname} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{user.fullname}</p>
            <p className="truncate text-xs text-fg-muted">@{user.username}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Correo', hideBelow: 'lg', cell: (user) => <span className="text-fg-muted">{user.email || '—'}</span> },
    { key: 'role', header: 'Rol', cell: (user) => <RoleBadge role={user.role} /> },
    { key: 'status', header: 'Estado', cell: (user) => <UserStatusBadge status={user.status} /> },
    {
      key: 'created',
      header: 'Registro',
      hideBelow: 'lg',
      cell: (user) => (
        <span className="text-fg-muted" title={formatRelative(user.created_at)}>
          {formatDate(user.created_at)}
        </span>
      ),
    },
    { key: 'actions', header: <span className="sr-only">Acciones</span>, align: 'right', width: 56, cell: (user) => <UserRowActions user={user} users={users} onEdit={openEdit} /> },
  ]

  const pendingCount = users.filter((u) => Number(u.status) === 0).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Cuentas con acceso al panel. Los registros nuevos quedan pendientes hasta que los actives."
        meta={query.isSuccess && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(users.length)}</span>}
        actions={
          <>
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
              Exportar CSV
            </Button>
            <Button onClick={openCreate} leftIcon={<Plus />}>
              Nuevo usuario
            </Button>
          </>
        }
      />

      {pendingCount > 0 && !isDirty && (
        <Alert
          variant="warning"
          title={`${pendingCount} ${pendingCount === 1 ? 'usuario pendiente' : 'usuarios pendientes'} de activación`}
          action={
            <Button size="sm" variant="outline" onClick={() => setFilter('estado', '0')}>
              Ver pendientes
            </Button>
          }
        >
          Activa las cuentas para que puedan ingresar al panel.
        </Alert>
      )}

      <UsersFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} resultCount={filtered.length} />

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && query.data && (
            <Alert variant="warning">No se pudo actualizar la lista. Mostrando datos guardados.</Alert>
          )}
          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            loading={query.isPending}
            caption="Listado de usuarios del panel"
            renderCard={(user) => <UserCard user={user} users={users} onEdit={openEdit} />}
            emptyState={
              isDirty ? (
                <EmptyState icon={UsersIcon} title="Sin resultados" description="Ningún usuario coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
              ) : (
                <EmptyState icon={UsersIcon} title="Aún no hay usuarios" description="Crea el primer usuario del panel." action={<Button onClick={openCreate} leftIcon={<Plus />}>Nuevo usuario</Button>} />
              )
            }
          />
          <Pagination
            {...pagination}
            onPageChange={onPageChange}
            onPageSizeChange={(size) => setFilter('por', String(size))}
            itemLabel="usuarios"
          />
        </>
      )}

      <UserFormDialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} user={dialog.user} users={users} />
    </div>
  )
}
