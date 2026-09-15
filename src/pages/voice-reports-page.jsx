import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCheck, Download, Mic } from 'lucide-react'
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
import { useLicensesQuery } from '@/features/licenses/licenses.queries'
import { BulkEnableDialog } from '@/features/voice-reports/components/bulk-enable-dialog'
import { QuotaBar } from '@/features/voice-reports/components/quota-bar'
import { VoiceReportEnableSwitch } from '@/features/voice-reports/components/voice-report-enable-switch'
import { VoiceReportDeviceCard } from '@/features/voice-reports/components/voice-report-device-card'
import { VoiceReportFilters } from '@/features/voice-reports/components/voice-report-filters'
import { VoiceReportSettingsCard } from '@/features/voice-reports/components/voice-report-settings-card'
import { VoiceReportStatTiles } from '@/features/voice-reports/components/voice-report-stat-tiles'
import { VoiceReportStateBadge } from '@/features/voice-reports/components/voice-report-state-badge'
import { useVoiceReportDevicesQuery } from '@/features/voice-reports/voice-reports.queries'
import { computeVoiceStats, filterVoiceReportDevices, mergeVoiceDevices, voiceDeviceLabel, voiceReportDevicesToCsv } from '@/features/voice-reports/voice-reports.utils'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { downloadCsv, timestampedFilename } from '@/lib/csv'
import { formatNumber, formatRelative, formatUsd, formatUtcDate, shortId } from '@/lib/format'
import { formatLicenseCode } from '@/lib/license-code'
import { toast } from '@/lib/toast'

const EMPTY = []
const FILTER_DEFAULTS = { q: '', estado: '', habilitado: '', pagina: '1', por: String(DEFAULT_PAGE_SIZE) }

export default function VoiceReportsPage() {
  useDocumentTitle('Dictado por voz')
  const navigate = useNavigate()
  const query = useVoiceReportDevicesQuery()
  const licenses = useLicensesQuery()
  const items = useMemo(() => mergeVoiceDevices(query.data, licenses.data) ?? EMPTY, [query.data, licenses.data])
  const stats = useMemo(() => (query.data ? computeVoiceStats(items, query.data.stats) : undefined), [items, query.data])
  const settings = query.data?.settings
  const { filters, setFilter, reset, isDirty } = useListFilters(FILTER_DEFAULTS)
  const [bulkOpen, setBulkOpen] = useState(false)

  const filtered = useMemo(() => filterVoiceReportDevices(items, filters), [items, filters])
  const pendingEnable = useMemo(() => filtered.filter((item) => !item.enabled), [filtered])
  const onPageChange = useCallback((page) => setFilter('pagina', String(page)), [setFilter])
  const pagination = usePagination({ items: filtered, page: Number(filters.pagina) || 1, pageSize: Number(filters.por) || DEFAULT_PAGE_SIZE, onPageChange })

  const handleExport = () => {
    if (!filtered.length) return toast.info('No hay dispositivos para exportar')
    downloadCsv(timestampedFilename('dictado-por-voz'), voiceReportDevicesToCsv(filtered))
    toast.success(`Exportados ${filtered.length} dispositivos`)
  }

  const columns = [
    {
      key: 'device',
      header: 'Dispositivo',
      cell: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{voiceDeviceLabel(item)}</p>
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
            Sin licencia vigente
          </Badge>
        ),
    },
    { key: 'enabled', header: 'Habilitado', cell: (item) => <VoiceReportEnableSwitch item={item} /> },
    { key: 'state', header: 'Estado', cell: (item) => <VoiceReportStateBadge state={item.state} reasonCode={item.reason_code} /> },
    { key: 'quota', header: 'Cuota', width: '11rem', cell: (item) => <QuotaBar quota={item.quota} /> },
    { key: 'errors', header: 'Errores', align: 'right', hideBelow: 'lg', cell: (item) => <span className={item.period_usage?.errors ? 'tabular-nums text-danger-text' : 'tabular-nums text-fg-muted'}>{formatNumber(item.period_usage?.errors)}</span> },
    { key: 'cost', header: 'Costo', align: 'right', hideBelow: 'lg', cell: (item) => <span className="tabular-nums text-fg">{formatUsd(item.period_usage?.cost_usd, { compact: true })}</span> },
    { key: 'users', header: 'Usuarios', align: 'right', hideBelow: 'xl', cell: (item) => <span className="tabular-nums text-fg">{formatNumber(item.period_usage?.distinct_users)}</span> },
    {
      key: 'last',
      header: 'Último dictado',
      hideBelow: 'lg',
      cell: (item) => <span className="text-fg-muted">{item.period_usage?.last_used_at ? formatRelative(item.period_usage.last_used_at) : '—'}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dictado por voz"
        description="Reportes dictados desde la app: la transcripción ocurre en el equipo y la redacción con DeepSeek. Cuotas, costos y control por dispositivo."
        meta={
          query.isSuccess && settings && (
            <Badge variant={settings.enabled ? 'success' : 'neutral'} dot>
              {settings.enabled ? 'Función activa' : 'Función apagada'}
            </Badge>
          )
        }
        actions={
          <>
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length} leftIcon={<Download />}>
              Exportar CSV
            </Button>
            <Button onClick={() => setBulkOpen(true)} disabled={!pendingEnable.length} leftIcon={<CheckCheck />}>
              Habilitar todos{pendingEnable.length ? ` (${pendingEnable.length})` : ''}
            </Button>
          </>
        }
      />

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.isError && query.data && <Alert variant="warning">No se pudo actualizar la información. Mostrando datos guardados.</Alert>}

          <VoiceReportStatTiles stats={stats} period={query.data?.period} loading={query.isPending} />

          <VoiceReportSettingsCard settings={settings} loading={query.isPending} />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
                Dispositivos
                {query.data?.period && <span className="ml-2 font-normal normal-case tracking-normal text-fg-subtle">período desde {formatUtcDate(query.data.period.start)} · reinicia {formatUtcDate(query.data.period.resets_at)}</span>}
              </h2>
              <DataFreshness updatedAt={query.dataUpdatedAt} isFetching={query.isFetching} onRefresh={() => query.refetch()} />
            </div>
            <VoiceReportFilters filters={filters} setFilter={setFilter} reset={reset} isDirty={isDirty} resultCount={filtered.length} />
            <DataTable
              columns={columns}
              rows={pagination.pageItems}
              rowKey={(item) => item.device_id}
              loading={query.isPending}
              caption="Dispositivos con dictado por voz"
              onRowClick={(item) => navigate(`/dictado/${encodeURIComponent(item.device_id)}`)}
              renderCard={(item) => <VoiceReportDeviceCard item={item} />}
              emptyState={
                isDirty ? (
                  <EmptyState icon={Mic} title="Sin resultados" description="Ningún dispositivo coincide con los filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />
                ) : (
                  <EmptyState icon={Mic} title="Aún no hay dispositivos" description="Aparecerán aquí los equipos con licencia activa, con configuración propia o con dictados en el período actual." />
                )
              }
            />
            <Pagination {...pagination} onPageChange={onPageChange} onPageSizeChange={(size) => setFilter('por', String(size))} itemLabel="dispositivos" />
          </section>
          <BulkEnableDialog open={bulkOpen} onOpenChange={setBulkOpen} devices={pendingEnable} />
        </>
      )}
    </div>
  )
}
