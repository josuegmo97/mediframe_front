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
