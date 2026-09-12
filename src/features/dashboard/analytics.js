import { eachMonthOfInterval, format, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { LICENSE_STATUS, LICENSE_STATUS_META } from '@/lib/constants'
import { parseDeviceDescription } from '@/lib/device-description'
import { toDate } from '@/lib/format'
import { effectiveLicenseStatus } from '@/lib/license-code'

/** Licencias creadas por mes (últimos `months` meses, con ceros). */
export function licensesPerMonth(licenses, months = 12, now = new Date()) {
  const start = startOfMonth(subMonths(now, months - 1))
  const buckets = eachMonthOfInterval({ start, end: now }).map((date) => ({
    key: format(date, 'yyyy-MM'),
    label: format(date, 'MMM yy', { locale: es }),
    created: 0,
  }))
  const index = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  for (const license of licenses ?? []) {
    const created = toDate(license.created_at)
    if (!created) continue
    const bucket = index.get(format(created, 'yyyy-MM'))
    if (bucket) bucket.created += 1
  }
  return buckets
}

/** Distribución por estado efectivo: [{ status, label, tone, value }] */
export function statusDistribution(licenses, now = Date.now()) {
  const counts = { 1: 0, 2: 0, 3: 0 }
  for (const license of licenses ?? []) {
    const status = effectiveLicenseStatus(license, now)
    if (counts[status] != null) counts[status] += 1
  }
  return [LICENSE_STATUS.AVAILABLE, LICENSE_STATUS.IN_USE, LICENSE_STATUS.EXPIRED].map((status) => ({
    status,
    label: LICENSE_STATUS_META[status].label,
    tone: LICENSE_STATUS_META[status].tone,
    value: counts[status],
  }))
}

function compareVersionsDesc(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

function topWithOther(entries, limit, otherLabel) {
  const sorted = [...entries].sort((a, b) => b.value - a.value)
  if (sorted.length <= limit) return sorted
  const head = sorted.slice(0, limit)
  const rest = sorted.slice(limit).reduce((sum, item) => sum + item.value, 0)
  return [...head, { label: otherLabel, value: rest, isOther: true }]
}

/**
 * Versiones de la app en uso. Prefiere la telemetría (una fila por instalación);
 * si no hay, usa las licencias en uso con `version`.
 */
export function versionsInUse(usageItems, licenses, limit = 6, now = Date.now()) {
  const counts = new Map()
  const source = usageItems?.length
    ? usageItems.map((item) => item.version)
    : (licenses ?? []).filter((l) => effectiveLicenseStatus(l, now) === LICENSE_STATUS.IN_USE).map((l) => l.version)
  for (const raw of source) {
    const version = String(raw ?? '').trim() || 'Sin versión'
    counts.set(version, (counts.get(version) ?? 0) + 1)
  }
  const entries = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || compareVersionsDesc(a.label, b.label))
  return topWithOther(entries, limit, 'Otras')
}

/** Modelos de Mac (familia) de las licencias que tienen dispositivo. */
export function deviceModels(licenses, limit = 6) {
  const counts = new Map()
  for (const license of licenses ?? []) {
    if (!license.device) continue
    const parsed = parseDeviceDescription(license.device_description)
    const family = parsed?.modelFamily ?? (parsed?.raw ? parsed.raw : 'Desconocido')
    counts.set(family, (counts.get(family) ?? 0) + 1)
  }
  const entries = [...counts.entries()].map(([label, value]) => ({ label, value }))
  return topWithOther(entries, limit, 'Otros')
}

/** Últimas sincronizaciones de telemetría. */
export function recentSyncs(usageItems, limit = 5) {
  return [...(usageItems ?? [])]
    .filter((item) => toDate(item.received_at))
    .sort((a, b) => toDate(b.received_at) - toDate(a.received_at))
    .slice(0, limit)
}
