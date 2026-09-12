import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as atcApi from '@/api/atc.api'
import { useAuth } from '@/features/auth/auth-provider'
import { qk } from '@/lib/query-keys'

const MINUTE = 60_000
const EMPTY = []

export function useAtcQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.atc.list(),
    queryFn: atcApi.listAtcMessages,
    select: (data) => data?.messages ?? EMPTY,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useAtcMessageQuery(id) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const listState = queryClient.getQueryState(qk.atc.list())
  const cached = listState?.data?.messages?.find((message) => message._id === id)
  return useQuery({
    queryKey: qk.atc.detail(id),
    queryFn: () => atcApi.getAtcMessage(id).then((data) => data.atc),
    initialData: cached,
    initialDataUpdatedAt: cached ? listState?.dataUpdatedAt : undefined,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && Boolean(id),
  })
}

export function useUpdateAtcStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: ({ id, status }) => atcApi.updateAtcStatus(id, status),
    onSuccess: ({ atc }) => {
      if (!atc) return
      queryClient.setQueryData(qk.atc.list(), (old) => (old ? { ...old, messages: (old.messages ?? []).map((m) => (m._id === atc._id ? atc : m)) } : old))
      queryClient.setQueryData(qk.atc.detail(atc._id), atc)
    },
  })
}
