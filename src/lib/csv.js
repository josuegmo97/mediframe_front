import { format } from 'date-fns'

const BOM = '﻿'

/** Un valor "parece fórmula" si empieza por = @ o por +/- seguido de algo que no es un número/teléfono. */
function looksLikeFormula(text) {
  if (/^[=@]/.test(text)) return true
  if (/^[+-]/.test(text)) return !/^[+-][\d\s().-]*$/.test(text)
  return false
}

export function escapeCsvCell(value) {
  if (value == null) return ''
  let text = String(value)
  if (looksLikeFormula(text)) text = `'${text}`
  if (/[",\n\r;]/.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

/**
 * @param {Array<object>} rows
 * @param {Array<{header: string, accessor: string | ((row: object) => unknown)}>} columns
 */
export function toCsv(rows, columns) {
  const header = columns.map((col) => escapeCsvCell(col.header)).join(',')
  const lines = rows.map((row) =>
    columns
      .map((col) => escapeCsvCell(typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]))
      .join(',')
  )
  return BOM + [header, ...lines].join('\r\n')
}

export function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadCsv(filename, csv) {
  downloadText(filename, csv, 'text/csv;charset=utf-8')
}

export function timestampedFilename(prefix, extension = 'csv', date = new Date()) {
  return `${prefix}_${format(date, 'yyyy-MM-dd_HHmm')}.${extension}`
}
