import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as licensesApi from '@/api/licenses.api'
import { useAuth } from '@/features/auth/auth-provider'
import { qk } from '@/lib/query-keys'
import { computeStats } from './licenses.utils'

const MINUTE = 60_000
const EMPTY = []

export function useLicensesQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.licenses.list(),
    queryFn: licensesApi.listLicenses,
    select: (data) => data?.licenses ?? EMPTY,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useLicenseStatsQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.licenses.stats(),
    queryFn: licensesApi.getLicenseStats,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

/** Detalle derivado del cache de la lista; solo pide a la red en deep-link con cache frío. */
export function useLicenseQuery(id) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const listState = queryClient.getQueryState(qk.licenses.list())
  const cached = listState?.data?.licenses?.find((license) => license._id === id)
  return useQuery({
    queryKey: qk.licenses.detail(id),
    queryFn: () => licensesApi.getLicense(id).then((data) => data.license),
    initialData: cached,
    initialDataUpdatedAt: cached ? listState?.dataUpdatedAt : undefined,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && Boolean(id),
  })
}

function patchList(queryClient, updater) {
  queryClient.setQueryData(qk.licenses.list(), (old) => {
    if (!old) return old
    const licenses = updater(old.licenses ?? [])
    const stats = computeStats(licenses)
    return { ...old, licenses, stats: { total: stats.total, available: stats.available, inUse: stats.inUse, expired: stats.expired } }
  })
  queryClient.invalidateQueries({ queryKey: qk.licenses.stats(), refetchType: 'none' })
}

export function useCreateLicense() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: licensesApi.createLicense,
    onSuccess: ({ license }) => {
      if (license) patchList(queryClient, (licenses) => [license, ...licenses])
    },
  })
}

export function useCreateLicenseBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: licensesApi.createLicenseBatch,
    onSuccess: () => {
      // La respuesta del lote no trae los documentos completos: se refresca la lista
      queryClient.invalidateQueries({ queryKey: qk.licenses.all })
    },
  })
}

export function useDeleteLicense() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: (id) => licensesApi.deleteLicense(id),
    onSuccess: (_data, id) => {
      patchList(queryClient, (licenses) => licenses.filter((license) => license._id !== id))
      queryClient.removeQueries({ queryKey: qk.licenses.detail(id) })
    },
  })
}
