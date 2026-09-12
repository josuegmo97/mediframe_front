import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/chart-card'
import { axisProps, useChartTheme } from '@/components/charts/chart-theme'
import { ChartTooltip } from '@/components/charts/chart-tooltip'

/** Barras horizontales de una sola serie (categorías nominales → un solo tono). */
export function HorizontalBarsChart({ title, description, data, loading, emptyDescription, seriesName, rowLabel }) {
  const theme = useChartTheme()
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const height = Math.max(160, data.length * 34 + 24)
  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      empty={!loading && total === 0}
      emptyDescription={emptyDescription}
      height={height}
      table={{
        columns: [
          { key: 'label', header: rowLabel },
          { key: 'value', header: seriesName, align: 'right' },
        ],
        rows: data.map((item) => ({ key: item.label, label: item.label, value: item.value })),
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }} barCategoryGap="28%">
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} {...axisProps(theme)} tick={{ fill: theme.textStrong, fontSize: 12 }} />
          <Tooltip cursor={{ fill: theme.grid, fillOpacity: 0.4 }} content={<ChartTooltip />} />
          <Bar dataKey="value" name={seriesName} fill={theme.series[0]} radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" fill={theme.textStrong} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
