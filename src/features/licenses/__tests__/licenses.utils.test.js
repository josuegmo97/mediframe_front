import { describe, expect, it } from 'vitest'
import { computeTermsStats, currentTermsAcceptances, filterLicenses, filterTermsLicenses, isLicensePaused, termsAcceptanceRows } from '../licenses.utils'

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

describe('terms requests', () => {
  const licenses = [
    {
      _id: 'old',
      code: '1111222233334444',
      owner_name: 'Clínica Norte',
      terms_request_id: 'r1',
      terms_requested_at: '2026-09-01T00:00:00Z',
      terms_acceptances: [
        { request_id: 'r1', user_name: 'Ana', is_sub_user: false, accepted_at: '2026-09-02T00:00:00Z' },
        { request_id: 'r1', user_name: 'Luis', is_sub_user: true, accepted_at: '2026-09-03T00:00:00Z' },
        { request_id: 'stale', user_name: 'Vieja', is_sub_user: false, accepted_at: '2026-08-01T00:00:00Z' },
      ],
    },
    { _id: 'new', code: '5555666677778888', terms_request_id: 'r2', terms_requested_at: '2026-09-10T00:00:00Z', terms_acceptances: [] },
    { _id: 'none', code: '9999000011112222', terms_acceptances: [{ request_id: 'x', user_name: 'Nadie' }] },
  ]

  it('only counts acceptances of the current request', () => {
    expect(currentTermsAcceptances(licenses[0]).map((a) => a.user_name)).toEqual(['Ana', 'Luis'])
    expect(currentTermsAcceptances(licenses[2])).toEqual([])
  })

  it('computes stats over licenses with a request', () => {
    expect(computeTermsStats(licenses)).toEqual({ requested: 2, accepted: 1, pending: 1, acceptances: 2 })
  })

  it('filters requests by acceptance state and search, newest request first', () => {
    expect(filterTermsLicenses(licenses).map((l) => l._id)).toEqual(['new', 'old'])
    expect(filterTermsLicenses(licenses, { estado: 'pendiente' }).map((l) => l._id)).toEqual(['new'])
    expect(filterTermsLicenses(licenses, { estado: 'aceptada' }).map((l) => l._id)).toEqual(['old'])
    expect(filterTermsLicenses(licenses, { q: 'norte' }).map((l) => l._id)).toEqual(['old'])
  })

  it('lists acceptances newest first, filterable by user type and name', () => {
    expect(termsAcceptanceRows(licenses).map((r) => r.user_name)).toEqual(['Luis', 'Ana'])
    expect(termsAcceptanceRows(licenses, { tipo: 'sub' }).map((r) => r.user_name)).toEqual(['Luis'])
    expect(termsAcceptanceRows(licenses, { tipo: 'titular' }).map((r) => r.user_name)).toEqual(['Ana'])
    expect(termsAcceptanceRows(licenses, { q: 'ana' }).map((r) => r.license._id)).toEqual(['old'])
  })
})
