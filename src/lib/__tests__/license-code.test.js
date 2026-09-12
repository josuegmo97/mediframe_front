import { describe, expect, it } from 'vitest'
import {
  effectiveLicenseStatus,
  formatLicenseCode,
  licenseCodeMatches,
  licenseDaysRemaining,
  licenseStatusMeta,
  normalizeLicenseCode,
} from '../license-code'

describe('formatLicenseCode', () => {
  it('groups 16-character codes in blocks of 4', () => {
    expect(formatLicenseCode('1234567890123456')).toBe('1234-5678-9012-3456')
    expect(formatLicenseCode('JSK19I3DMXJV38FK')).toBe('JSK1-9I3D-MXJV-38FK')
    expect(formatLicenseCode('jsk1-9i3d-mxjv-38fk')).toBe('JSK1-9I3D-MXJV-38FK')
  })

  it('returns other lengths untouched', () => {
    expect(formatLicenseCode('ABC')).toBe('ABC')
    expect(formatLicenseCode('')).toBe('')
    expect(formatLicenseCode(null)).toBe('')
  })
})

describe('normalizeLicenseCode / licenseCodeMatches', () => {
  it('strips separators and uppercases', () => {
    expect(normalizeLicenseCode(' 1234-5678 9012_3456 ')).toBe('1234567890123456')
  })

  it('matches partial queries ignoring dashes', () => {
    expect(licenseCodeMatches('1234567890123456', '5678-9012')).toBe(true)
    expect(licenseCodeMatches('1234567890123456', '9999')).toBe(false)
    expect(licenseCodeMatches('1234567890123456', '')).toBe(false)
  })
})

describe('effectiveLicenseStatus', () => {
  const now = new Date('2026-09-12T12:00:00Z').getTime()

  it('treats in-use licenses past expired_at as expired', () => {
    expect(effectiveLicenseStatus({ status: 2, expired_at: '2026-09-01T00:00:00Z' }, now)).toBe(3)
    expect(effectiveLicenseStatus({ status: 2, expired_at: '2026-12-01T00:00:00Z' }, now)).toBe(2)
  })

  it('keeps other statuses as-is', () => {
    expect(effectiveLicenseStatus({ status: 1, expired_at: null }, now)).toBe(1)
    expect(effectiveLicenseStatus({ status: '3' }, now)).toBe(3)
    expect(effectiveLicenseStatus(null, now)).toBeNull()
  })
})

describe('licenseDaysRemaining', () => {
  const now = new Date('2026-09-12T12:00:00Z').getTime()

  it('prefers the server-computed days_remaining', () => {
    expect(licenseDaysRemaining({ status: 2, expired_at: '2026-12-01T00:00:00Z', days_remaining: 7 }, now)).toBe(7)
  })

  it('computes whole days when the virtual is missing', () => {
    expect(licenseDaysRemaining({ status: 2, expired_at: '2026-09-15T18:00:00Z' }, now)).toBe(3)
  })

  it('returns null for licenses not in use', () => {
    expect(licenseDaysRemaining({ status: 1 }, now)).toBeNull()
    expect(licenseDaysRemaining({ status: 2, expired_at: '2026-09-01T00:00:00Z', days_remaining: 0 }, now)).toBeNull()
  })
})

describe('licenseStatusMeta', () => {
  it('maps known and unknown statuses', () => {
    expect(licenseStatusMeta(1).label).toBe('Disponible')
    expect(licenseStatusMeta('2').tone).toBe('info')
    expect(licenseStatusMeta(9)).toEqual({ label: 'Desconocido', tone: 'neutral' })
  })
})
