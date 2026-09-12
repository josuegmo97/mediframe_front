import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as contactsApi from '@/api/contacts.api'
import { useAuth } from '@/features/auth/auth-provider'
import { qk } from '@/lib/query-keys'

const MINUTE = 60_000
const EMPTY = []

export function useContactsQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.contacts.list(),
    queryFn: contactsApi.listContacts,
    select: (data) => data?.contacts ?? EMPTY,
    staleTime: 10 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: ({ id, status }) => contactsApi.updateContactStatus(id, status),
    onSuccess: ({ contact }) => {
      if (!contact) return
      queryClient.setQueryData(qk.contacts.list(), (old) => (old ? { ...old, contacts: (old.contacts ?? []).map((c) => (c._id === contact._id ? contact : c)) } : old))
    },
  })
}
