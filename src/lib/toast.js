import { toast } from 'sonner'
import { normalizeApiError } from './api-error'

/** Toast de error a partir de cualquier error (ApiError, axios, Error). Deduplica por código. */
export function toastApiError(error, fallback) {
  const normalized = normalizeApiError(error)
  if (normalized.isCancelled) return normalized
  toast.error(normalized.message || fallback || 'Ocurrió un error inesperado.', {
    id: `api-error-${normalized.code}`,
  })
  return normalized
}

export { toast }
