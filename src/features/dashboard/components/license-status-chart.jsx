import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard, ChartLegend } from '@/components/charts/chart-card'
import { useChartTheme } from '@/components/charts/chart-theme'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { LICENSE_STATUS } from '@/lib/constants'
import { formatNumber } from '@/lib/format'

/**
 * Los tres estados forman un ciclo (disponible → en uso → expirada), así que se codifican con una
 * rampa de un solo tono (claro = expirada, medio = disponible, oscuro = en uso). Una rampa de
 * luminosidad se distingue con cualquier tipo de visión del color; la leyenda con conteos y la
 * vista de tabla completan la identidad de cada segmento.
 */
const STATUS_TO_RAMP = { [LICENSE_STATUS.EXPIRED]: 0, [LICENSE_STATUS.AVAILABLE]: 1, [LICENSE_STATUS.IN_USE]: 2 }

export function LicenseStatusChart({ data, loading }) {
  const theme = useChartTheme()
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const ramp = theme.ramp ?? theme.series
  const colored = data.map((item) => ({ ...item, color: ramp[STATUS_TO_RAMP[item.status] ?? 1] ?? theme.series[0] }))

  return (
    <ChartCard
      title="Estado de las licencias"
      description="Distribución actual"
      loading={loading}
      empty={!loading && total === 0}
      emptyDescription="Crea licencias para ver su distribución."
      height={200}
      legend={<ChartLegend items={colored.map((item) => ({ label: item.label, color: item.color, value: formatNumber(item.value) }))} />}
      table={{
        columns: [
          { key: 'label', header: 'Estado' },
          { key: 'value', header: 'Licencias', align: 'right' },
          { key: 'pct', header: '%', align: 'right' },
        ],
        rows: colored.map((item) => ({ key: item.status, label: item.label, value: item.value, pct: total ? `${Math.round((item.value / total) * 100)}%` : '0%' })),
      }}
    >
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={colored} dataKey="value" nameKey="label" innerRadius="64%" outerRadius="88%" paddingAngle={2} stroke={theme.surface} strokeWidth={2} isAnimationActive={false}>
              {colored.map((item) => (
                <Cell key={item.status} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-fg">{formatNumber(total)}</span>
          <span className="text-xs text-fg-muted">licencias</span>
        </div>
      </div>
    </ChartCard>
  )
}
