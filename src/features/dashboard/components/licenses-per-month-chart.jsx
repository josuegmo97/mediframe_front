import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/chart-card'
import { axisProps, useChartTheme } from '@/components/charts/chart-theme'
import { ChartTooltip } from '@/components/charts/chart-tooltip'

export function LicensesPerMonthChart({ data, loading }) {
  const theme = useChartTheme()
  const total = data.reduce((sum, bucket) => sum + bucket.created, 0)
  return (
    <ChartCard
      title="Licencias creadas por mes"
      description="Últimos 12 meses"
      loading={loading}
      empty={!loading && total === 0}
      emptyDescription="Aún no se han creado licencias en el último año."
      height={240}
      table={{
        columns: [
          { key: 'label', header: 'Mes' },
          { key: 'created', header: 'Creadas', align: 'right' },
        ],
        rows: data.map((b) => ({ key: b.key, label: b.label, created: b.created })),
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={theme.grid} strokeWidth={1} />
          <XAxis dataKey="label" {...axisProps(theme)} interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} {...axisProps(theme)} width={44} />
          <Tooltip cursor={{ fill: theme.grid, fillOpacity: 0.4 }} content={<ChartTooltip />} />
          <Bar dataKey="created" name="Creadas" fill={theme.series[0]} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
