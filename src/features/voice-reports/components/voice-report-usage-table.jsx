import { useCallback } from 'react'
import { History } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { useListFilters } from '@/hooks/use-list-filters'
import { DEFAULT_PAGE_SIZE, VOICE_REPORT_ERROR_LABEL, VOICE_REPORT_LANGUAGE_LABEL, VOICE_REPORT_USAGE_STATUS_META } from '@/lib/constants'
import { formatDateTime, formatDuration, formatNumber, formatRelative, formatUsd, shortId } from '@/lib/format'
import { useVoiceReportDeviceUsageQuery } from '../voice-reports.queries'

const FILTER_DEFAULTS = { estado: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

function UsageRowCard({ row }) {
  const meta = VOICE_REPORT_USAGE_STATUS_META[row.status] ?? { label: row.status, tone: 'neutral' }
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{formatDateTime(row.created_at)}</p>
          <p className="truncate font-mono text-xs text-fg-subtle">{shortId(row.request_id, 13)}</p>
        </div>
        <Badge variant={meta.tone} dot>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-fg-muted">
        {VOICE_REPORT_LANGUAGE_LABEL[row.language] ?? row.language ?? '—'} · {row.study_type || 'Sin tipo de estudio'} · {formatDuration(row.duration_seconds)}
      </p>
      <p className="mt-1 text-xs text-fg-subtle">
        {row.status === 'error' ? VOICE_REPORT_ERROR_LABEL[row.error_code] ?? row.error_code : `${formatNumber(row.input_tokens)} + ${formatNumber(row.output_tokens)} tokens · ${formatUsd(row.cost_usd)}`}
      </p>
    </div>
  )
}

/** Historial de requests de un dispositivo, paginado en el servidor. */
export function VoiceReportUsageTable({ deviceId }) {
  const { filters, setFilter } = useListFilters(FILTER_DEFAULTS)
  const page = Math.max(1, Number(filters.pagina) || 1)
  const limit = Number(filters.por) || DEFAULT_PAGE_SIZE
  const params = { page, limit, ...(filters.estado ? { status: filters.estado } : {}) }
  const query = useVoiceReportDeviceUsageQuery(deviceId, params)
  const onPageChange = useCallback((next) => setFilter('pagina', String(next)), [setFilter])

  const rows = query.data?.items ?? []
  const pagination = query.data?.pagination

  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-fg" title={formatDateTime(row.created_at)}>{formatRelative(row.created_at)}</p>
          <p className="text-xs text-fg-subtle">{formatDateTime(row.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (row) => {
        const meta = VOICE_REPORT_USAGE_STATUS_META[row.status] ?? { label: row.status, tone: 'neutral' }
        const error = row.status === 'error' ? VOICE_REPORT_ERROR_LABEL[row.error_code] ?? row.error_code : null
        return (
          <div className="min-w-0">
            <Badge variant={meta.tone} dot>
              {meta.label}
            </Badge>
            {error && <p className="mt-1 text-xs text-danger-text">{error}</p>}
            {row.status === 'success' && row.improved === false && <p className="mt-1 text-xs text-fg-subtle">Sin redacción (texto literal)</p>}
          </div>
        )
      },
    },
    {
      key: 'study',
      header: 'Estudio',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-fg">{row.study_type || <span className="text-fg-subtle">Sin tipo</span>}</p>
          <p className="text-xs text-fg-subtle">{VOICE_REPORT_LANGUAGE_LABEL[row.language] ?? row.language ?? '—'} · v{row.app_version}</p>
        </div>
      ),
    },
    { key: 'duration', header: 'Duración', align: 'right', cell: (row) => <span className="tabular-nums text-fg">{formatDuration(row.duration_seconds)}</span> },
    {
      key: 'tokens',
      header: 'Tokens',
      align: 'right',
      hideBelow: 'xl',
      cell: (row) => (
        <Tooltip content={`${formatNumber(row.input_tokens)} de entrada · ${formatNumber(row.output_tokens)} de salida`}>
          <span className="tabular-nums text-fg">{formatNumber((row.input_tokens ?? 0) + (row.output_tokens ?? 0))}</span>
        </Tooltip>
      ),
    },
    { key: 'cost', header: 'Costo', align: 'right', cell: (row) => <span className="tabular-nums text-fg">{formatUsd(row.cost_usd)}</span> },
    { key: 'latency', header: 'Latencia', align: 'right', hideBelow: 'xl', cell: (row) => <span className="tabular-nums text-fg-muted">{row.latency_ms != null ? `${formatNumber(row.latency_ms)} ms` : '—'}</span> },
    { key: 'request', header: 'Request', hideBelow: 'xl', cell: (row) => <span className="font-mono text-xs text-fg-subtle">{shortId(row.request_id, 8)}</span> },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <History className="h-4 w-4 text-fg-muted" aria-hidden="true" />
          Historial de dictados
          {pagination && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm tabular-nums text-fg-muted">{formatNumber(pagination.total)}</span>}
        </h2>
        <Select
          aria-label="Filtrar historial por estado"
          value={filters.estado}
          onChange={(event) => setFilter('estado', event.target.value)}
          className="w-44"
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'success', label: 'Exitosos' },
            { value: 'error', label: 'Con error' },
          ]}
        />
      </div>

      {query.isError && !query.data ? (
        <ErrorState compact error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && query.data && <Alert variant="warning">No se pudo actualizar el historial. Mostrando datos guardados.</Alert>}
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            loading={query.isPending}
            dense
            caption="Historial de dictados del dispositivo"
            renderCard={(row) => <UsageRowCard row={row} />}
            emptyState={
              <EmptyState compact icon={History} title={filters.estado ? 'Sin resultados' : 'Sin dictados registrados'} description={filters.estado ? 'Ningún dictado coincide con el filtro.' : 'Este dispositivo aún no ha enviado dictados.'} />
            }
          />
          {pagination && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              from={pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              to={Math.min(pagination.page * pagination.limit, pagination.total)}
              onPageChange={onPageChange}
              onPageSizeChange={(size) => setFilter('por', String(size))}
              itemLabel="dictados"
            />
          )}
        </>
      )}
    </div>
  )
}
