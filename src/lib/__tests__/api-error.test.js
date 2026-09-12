import { describe, expect, it, vi } from 'vitest'
import { ApiError, applyFieldErrors, getErrorMessage, normalizeApiError } from '../api-error'

const httpError = (status, data) => ({ response: { status, data }, message: `Request failed with status code ${status}` })

describe('normalizeApiError', () => {
  it('maps a validation error with details', () => {
    const err = normalizeApiError(
      httpError(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error de validación',
          details: [{ field: undefined, message: 'El username es requerido', value: '' }],
        },
      })
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.isValidation).toBe(true)
    expect(err.message).toBe('El username es requerido')
    expect(err.details).toHaveLength(1)
  })

  it('maps a string error body (HMAC style)', () => {
    const err = normalizeApiError(httpError(401, { success: false, error: 'No autorizado' }))
    expect(err.code).toBe('ERROR')
    expect(err.message).toBe('No autorizado')
    expect(err.isAuth).toBe(true)
  })

  it('maps a plain-text 429', () => {
    const err = normalizeApiError(httpError(429, 'Demasiados intentos de autenticación, por favor intente más tarde'))
    expect(err.isRateLimited).toBe(true)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.message).toMatch(/Demasiadas solicitudes/)
  })

  it('maps a JSON 429', () => {
    const err = normalizeApiError(httpError(429, { success: false, error: 'Demasiadas solicitudes' }))
    expect(err.isRateLimited).toBe(true)
    expect(err.code).toBe('RATE_LIMITED')
  })

  it('maps network errors and timeouts', () => {
    const network = normalizeApiError({ code: 'ERR_NETWORK', message: 'Network Error' })
    expect(network.isNetwork).toBe(true)
    expect(network.code).toBe('NETWORK')
    expect(network.status).toBeNull()

    const timeout = normalizeApiError({ code: 'ECONNABORTED', message: 'timeout of 20000ms exceeded' })
    expect(timeout.isTimeout).toBe(true)
    expect(timeout.code).toBe('TIMEOUT')
  })

  it('maps HTML gateway errors by status', () => {
    const err = normalizeApiError(httpError(502, '<html><body>Bad Gateway</body></html>'))
    expect(err.code).toBe('HTTP_502')
    expect(err.isServer).toBe(true)
    expect(err.message).toMatch(/no está disponible/)
  })

  it('applies friendly messages and field mapping by code', () => {
    const login = normalizeApiError(httpError(403, { success: false, error: { code: 'LOGIN_004', message: 'Usuario inactivo. Contacte al administrador' } }))
    expect(login.message).toMatch(/aún no ha sido activada/)
    expect(login.isForbidden).toBe(true)

    const register = normalizeApiError(httpError(400, { success: false, error: { code: 'REGISTER_004', message: 'El username ya está en uso' } }))
    expect(register.fieldErrors).toEqual({ username: 'Ese nombre de usuario ya está en uso.' })
  })

  it('falls back to the backend message for unknown codes', () => {
    const err = normalizeApiError(httpError(400, { success: false, error: { code: 'LICENSE_013', message: 'La cantidad debe estar entre 1 y 100' } }))
    expect(err.message).toBe('La cantidad debe estar entre 1 y 100')
  })

  it('passes ApiError through and marks cancellations as handled', () => {
    const original = new ApiError({ status: 418, code: 'TEAPOT', message: 'x' })
    expect(normalizeApiError(original)).toBe(original)

    const cancelled = normalizeApiError({ code: 'ERR_CANCELED', name: 'CanceledError' })
    expect(cancelled.isCancelled).toBe(true)
    expect(cancelled.handled).toBe(true)
  })
})

describe('applyFieldErrors / getErrorMessage', () => {
  it('sets errors only on known fields and reports whether any matched', () => {
    const setError = vi.fn()
    const err = normalizeApiError(httpError(400, { success: false, error: { code: 'REGISTER_005', message: 'El email ya está en uso' } }))
    expect(applyFieldErrors(setError, err, ['username', 'email'])).toBe(true)
    expect(setError).toHaveBeenCalledWith('email', { type: 'server', message: 'Ese correo ya está en uso.' })

    const other = vi.fn()
    expect(applyFieldErrors(other, err, ['password'])).toBe(false)
    expect(other).not.toHaveBeenCalled()
  })

  it('returns a message for anything', () => {
    expect(getErrorMessage(new Error('boom'))).toMatch(/conectar/)
    expect(getErrorMessage(httpError(404, { success: false, error: { code: 'NOT_FOUND', message: 'Ruta /x no encontrada' } }))).toBe('No encontramos lo que buscas.')
  })
})
