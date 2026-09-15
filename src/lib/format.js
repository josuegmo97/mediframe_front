import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'

export const EMPTY = '—'

export function toDate(value) {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : typeof value === 'string' ? parseISO(value) : new Date(value)
  return isValid(date) ? date : null
}

export function formatDate(value, pattern = 'd MMM yyyy') {
  const date = toDate(value)
  return date ? format(date, pattern, { locale: es }) : EMPTY
}

/** Fecha de calendario en UTC (para períodos que el backend calcula en UTC, p. ej. "1 sep"). */
export function formatUtcDate(value, pattern = 'd MMM yyyy') {
  const date = toDate(value)
  if (!date) return EMPTY
  return format(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()), pattern, { locale: es })
}

export function formatDateTime(value) {
  return formatDate(value, 'd MMM yyyy, HH:mm')
}

export function formatRelative(value) {
  const date = toDate(value)
  if (!date) return EMPTY
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: es })
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return EMPTY
  return new Intl.NumberFormat('es').format(Number(value))
}

/** Días de calendario desde hoy hasta la fecha (negativo si ya pasó). */
export function daysUntil(value) {
  const date = toDate(value)
  return date ? differenceInCalendarDays(date, new Date()) : null
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return Number(count) === 1 ? singular : plural
}

export function initials(name, max = 2) {
  if (!name) return '?'
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** Acorta identificadores largos (UUIDs) conservando el inicio. */
export function shortId(value, head = 8) {
  if (!value) return EMPTY
  const text = String(value)
  return text.length > head + 1 ? `${text.slice(0, head)}…` : text
}

export function formatDays(days) {
  if (days == null) return EMPTY
  return `${formatNumber(days)} ${pluralize(days, 'día')}`
}

/** Importe en dólares con hasta 4 decimales (los costos por dictado son de centavos). */
export function formatUsd(value, { compact = false } = {}) {
  if (value == null || Number.isNaN(Number(value))) return EMPTY
  const amount = Number(value)
  const digits = compact || amount >= 1 ? 2 : 4
  return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: digits }).format(amount)
}

/** Segundos → "1 h 05 min", "3 min 20 s" o "45 s". */
export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return EMPTY
  const total = Math.max(0, Math.round(Number(seconds)))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`
  if (m > 0) return s ? `${m} min ${s} s` : `${m} min`
  return `${s} s`
}

/** Bytes → "2,9 MB". */
export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return EMPTY
  const value = Number(bytes)
  if (value < 1024) return `${formatNumber(value)} B`
  if (value < 1024 ** 2) return `${new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(value / 1024)} KB`
  return `${new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(value / 1024 ** 2)} MB`
}
