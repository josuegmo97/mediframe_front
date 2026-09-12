import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as usageApi from '@/api/usage.api'
import { useAuth } from '@/features/auth/auth-provider'
import { normalizeDeviceId } from '@/lib/device-description'
import { qk } from '@/lib/query-keys'

const MINUTE = 60_000

/** Telemetría completa: { items, stats }. */
export function useUsageQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.usage.list(),
    queryFn: usageApi.listUsage,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useUsageDeviceQuery(deviceId) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const key = normalizeDeviceId(deviceId)
  const listState = queryClient.getQueryState(qk.usage.list())
  const cached = listState?.data?.items?.find((item) => normalizeDeviceId(item.device_id) === key)
  return useQuery({
    queryKey: qk.usage.detail(key),
    queryFn: () => usageApi.getUsageByDevice(key).then((data) => data.item),
    initialData: cached,
    initialDataUpdatedAt: cached ? listState?.dataUpdatedAt : undefined,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && Boolean(key),
  })
}
