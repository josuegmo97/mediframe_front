import { describe, expect, it } from 'vitest'
import { filterLicenses, isLicensePaused } from '../licenses.utils'

const NOW = new Date('2026-10-01T00:00:00Z').getTime()
const FUTURE = '2026-12-01T00:00:00Z'
const PAST = '2026-09-01T00:00:00Z'

describe('isLicensePaused', () => {
  it('is true only for paused licenses still in use', () => {
    expect(isLicensePaused({ status: 2, paused: true, expired_at: FUTURE }, NOW)).toBe(true)
    expect(isLicensePaused({ status: 2, paused: false, expired_at: FUTURE }, NOW)).toBe(false)
    expect(isLicensePaused({ status: 2, paused: true, expired_at: PAST }, NOW)).toBe(false)
    expect(isLicensePaused({ status: 1, paused: true }, NOW)).toBe(false)
  })
})

describe('filterLicenses estado=pausada', () => {
  it('keeps only paused in-use licenses', () => {
    const licenses = [
      { _id: 'a', code: 'A', status: 2, paused: true, expired_at: FUTURE },
      { _id: 'b', code: 'B', status: 2, paused: false, expired_at: FUTURE },
      { _id: 'c', code: 'C', status: 3, paused: true, expired_at: PAST },
    ]
    expect(filterLicenses(licenses, { estado: 'pausada' }, NOW).map((l) => l._id)).toEqual(['a'])
    expect(filterLicenses(licenses, { estado: '2' }, NOW).map((l) => l._id)).toEqual(['a', 'b'])
  })
})
