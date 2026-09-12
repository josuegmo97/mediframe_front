import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { normalizeApiError } from './api-error'
import { toastApiError } from './toast'

const MINUTE = 60_000

/** Solo se reintenta una vez y solo ante errores de red (nunca 4xx/5xx, por los rate limiters). */
function shouldRetry(failureCount, error) {
  const normalized = normalizeApiError(error)
  return normalized.isNetwork && !normalized.isTimeout && failureCount < 1
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * MINUTE,
        gcTime: 30 * MINUTE,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: 0,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const normalized = normalizeApiError(error)
        if (normalized.handled || query.meta?.silent) return
        // Las páginas renderizan el error en sitio; solo se toastea lo que no tiene UI propia
        if (normalized.isRateLimited || normalized.isServer || normalized.isNetwork) {
          toastApiError(normalized)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const normalized = normalizeApiError(error)
        if (normalized.handled || mutation.meta?.silent) return
        toastApiError(normalized)
      },
    }),
  })
}
