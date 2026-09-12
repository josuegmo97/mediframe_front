import { describe, expect, it } from 'vitest'
import { decodeJwt, getTokenExpiryMs, getTokenRemainingMs, isTokenExpired } from '../jwt'

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const makeToken = (payload) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`

describe('decodeJwt', () => {
  it('decodes the payload of a well-formed token', () => {
    expect(decodeJwt(makeToken({ userId: 'abc', exp: 123 }))).toEqual({ userId: 'abc', exp: 123 })
  })

  it('handles unicode in the payload', () => {
    expect(decodeJwt(makeToken({ name: 'Pérez ñ' })).name).toBe('Pérez ñ')
  })

  it('returns null for garbage', () => {
    expect(decodeJwt('not-a-token')).toBeNull()
    expect(decodeJwt('a.b')).toBeNull()
    expect(decodeJwt('a.!!!.c')).toBeNull()
    expect(decodeJwt(null)).toBeNull()
    expect(decodeJwt(42)).toBeNull()
  })
})

describe('expiry helpers', () => {
  const now = 1_800_000_000_000

  it('reads exp in milliseconds', () => {
    expect(getTokenExpiryMs(makeToken({ exp: 1_800_000_900 }))).toBe(1_800_000_900_000)
    expect(getTokenExpiryMs(makeToken({ userId: 'x' }))).toBeNull()
  })

  it('treats a token without exp as expired', () => {
    expect(isTokenExpired(makeToken({ userId: 'x' }), 5000, now)).toBe(true)
    expect(isTokenExpired('garbage', 5000, now)).toBe(true)
  })

  it('applies skew when deciding expiry', () => {
    const token = makeToken({ exp: now / 1000 + 4 }) // expires in 4 s
    expect(isTokenExpired(token, 5000, now)).toBe(true)
    expect(isTokenExpired(token, 0, now)).toBe(false)
  })

  it('reports remaining milliseconds', () => {
    expect(getTokenRemainingMs(makeToken({ exp: now / 1000 + 60 }), now)).toBe(60_000)
    expect(getTokenRemainingMs(makeToken({ exp: now / 1000 - 60 }), now)).toBe(-60_000)
    expect(getTokenRemainingMs('garbage', now)).toBe(0)
  })
})
