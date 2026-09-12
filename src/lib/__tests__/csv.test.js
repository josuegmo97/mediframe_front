import { describe, expect, it } from 'vitest'
import { escapeCsvCell, timestampedFilename, toCsv } from '../csv'

describe('escapeCsvCell', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
  })

  it('quotes values with commas, quotes, newlines and semicolons', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell('line\nbreak')).toBe('"line\nbreak"')
    expect(escapeCsvCell('x;y')).toBe('"x;y"')
  })

  it('neutralizes formula-looking values', () => {
    expect(escapeCsvCell('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(escapeCsvCell('@cmd')).toBe("'@cmd")
    expect(escapeCsvCell('+cmd|calc')).toBe("'+cmd|calc")
    expect(escapeCsvCell('-abc')).toBe("'-abc")
  })

  it('keeps phone numbers and negative numbers intact', () => {
    expect(escapeCsvCell('+58 (412) 123-4567')).toBe('+58 (412) 123-4567')
    expect(escapeCsvCell('-5')).toBe('-5')
    expect(escapeCsvCell(12)).toBe('12')
  })
})

describe('toCsv', () => {
  it('builds a BOM-prefixed CRLF csv with header and accessors', () => {
    const rows = [{ name: 'Ana, Dra.', count: 3 }]
    const csv = toCsv(rows, [
      { header: 'NOMBRE', accessor: 'name' },
      { header: 'TOTAL', accessor: (r) => r.count * 2 },
    ])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.slice(1)).toBe('NOMBRE,TOTAL\r\n"Ana, Dra.",6')
  })

  it('produces only the header for empty rows', () => {
    expect(toCsv([], [{ header: 'A', accessor: 'a' }]).slice(1)).toBe('A')
  })
})

describe('timestampedFilename', () => {
  it('formats prefix + date + extension', () => {
    const date = new Date(2026, 8, 12, 9, 5)
    expect(timestampedFilename('usuarios', 'csv', date)).toBe('usuarios_2026-09-12_0905.csv')
    expect(timestampedFilename('codigos', 'txt', date)).toBe('codigos_2026-09-12_0905.txt')
  })
})
