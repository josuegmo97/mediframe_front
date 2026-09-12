import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme/theme-provider'

const VARS = {
  series: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'],
  ramp: ['--chart-ramp-1', '--chart-ramp-2', '--chart-ramp-3'],
  grid: '--chart-grid',
  text: '--fg-muted',
  textStrong: '--fg',
  subtle: '--fg-subtle',
  surface: '--surface',
  border: '--border',
  success: '--success',
  info: '--info',
  danger: '--danger',
  warning: '--warning',
  accent: '--accent',
}

function readVar(name, fallback = '0 0 0') {
  if (typeof window === 'undefined') return `rgb(${fallback})`
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return `rgb(${value || fallback})`
}

function readTheme() {
  const series = VARS.series.map((name) => readVar(name))
  const ramp = VARS.ramp.map((name) => readVar(name))
  return {
    series,
    ramp,
    grid: readVar(VARS.grid),
    text: readVar(VARS.text),
    textStrong: readVar(VARS.textStrong),
    subtle: readVar(VARS.subtle),
    surface: readVar(VARS.surface),
    border: readVar(VARS.border),
    // Estados sobre las series validadas: verde, azul, naranja, rojo
    status: {
      success: series[0],
      info: series[1],
      warning: series[2],
      danger: series[4],
    },
    accent: readVar(VARS.accent),
  }
}

/** Colores de gráfico leídos de los tokens CSS; se recalculan al cambiar el tema. */
export function useChartTheme() {
  const { resolvedTheme } = useTheme()
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    // El cambio de clase .dark ocurre en un efecto del ThemeProvider; leer en el siguiente frame
    const id = requestAnimationFrame(() => setTheme(readTheme()))
    return () => cancelAnimationFrame(id)
  }, [resolvedTheme])

  return theme
}

/** Props comunes de ejes/grid recharts según la guía: hairline sólido, texto en tokens. */
export function axisProps(theme) {
  return {
    tick: { fill: theme.text, fontSize: 12 },
    axisLine: false,
    tickLine: false,
  }
}
