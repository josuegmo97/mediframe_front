import { describe, expect, it } from 'vitest'
import { deviceModels, licensesPerMonth, recentSyncs, statusDistribution, versionsInUse } from '../analytics'

const NOW = new Date('2026-09-12T12:00:00Z')

describe('licensesPerMonth', () => {
  it('zero-fills the last 12 months and counts created_at per month', () => {
    const result = licensesPerMonth(
      [{ created_at: '2026-09-01T10:00:00Z' }, { created_at: '2026-09-10T10:00:00Z' }, { created_at: '2026-07-03T10:00:00Z' }, { created_at: '2024-01-01T00:00:00Z' }],
      12,
      NOW
    )
    expect(result).toHaveLength(12)
    expect(result[0].key).toBe('2025-10')
    expect(result.at(-1)).toMatchObject({ key: '2026-09', created: 2 })
    expect(result.find((b) => b.key === '2026-07').created).toBe(1)
    expect(result.reduce((sum, b) => sum + b.created, 0)).toBe(3)
  })
})

describe('statusDistribution', () => {
  it('uses the effective status (stale in-use counts as expired)', () => {
    const now = NOW.getTime()
    const result = statusDistribution(
      [{ status: 1 }, { status: 2, expired_at: '2027-01-01T00:00:00Z' }, { status: 2, expired_at: '2026-01-01T00:00:00Z' }, { status: 3 }],
      now
    )
    expect(result.map((r) => [r.label, r.value])).toEqual([
      ['Disponible', 1],
      ['En uso', 1],
      ['Expirada', 2],
    ])
  })
})

describe('versionsInUse', () => {
  it('prefers usage items and folds the tail into "Otras"', () => {
    const items = [
      ...Array(5).fill({ version: '3.1.0' }),
      ...Array(3).fill({ version: '3.0.2' }),
      { version: '2.9.0' },
      { version: '2.8.0' },
      { version: '' },
    ]
    const result = versionsInUse(items, [], 2)
    expect(result).toEqual([
      { label: '3.1.0', value: 5 },
      { label: '3.0.2', value: 3 },
      { label: 'Otras', value: 3, isOther: true },
    ])
  })

  it('falls back to in-use licenses when there is no telemetry', () => {
    const result = versionsInUse([], [{ status: 2, version: '3.1.0', expired_at: '2027-01-01T00:00:00Z' }, { status: 1, version: '' }], 6, NOW.getTime())
    expect(result).toEqual([{ label: '3.1.0', value: 1 }])
  })
})

describe('deviceModels', () => {
  it('groups by Mac family and ignores licenses without device', () => {
    const result = deviceModels([
      { device: 'A', device_description: 'Mac=Model:MacBookPro18,3|Arch:arm64' },
      { device: 'B', device_description: 'Mac=Model:MacBookPro16,1|Arch:x86_64' },
      { device: 'C', device_description: 'Mac=Model:Macmini9,1' },
      { device: null, device_description: 'Mac=Model:iMac21,1' },
      { device: 'D', device_description: '' },
    ])
    expect(result).toEqual([
      { label: 'MacBook Pro', value: 2 },
      { label: 'Mac mini', value: 1 },
      { label: 'Desconocido', value: 1 },
    ])
  })
})

describe('recentSyncs', () => {
  it('sorts by received_at desc and limits', () => {
    const result = recentSyncs(
      [{ device_id: 'a', received_at: '2026-09-01T00:00:00Z' }, { device_id: 'b', received_at: '2026-09-11T00:00:00Z' }, { device_id: 'c', received_at: null }],
      1
    )
    expect(result.map((r) => r.device_id)).toEqual(['b'])
  })
})
