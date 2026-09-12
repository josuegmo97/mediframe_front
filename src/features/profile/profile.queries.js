import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '@/api/users.api'
import { useAuth } from '@/features/auth/auth-provider'
import { qk } from '@/lib/query-keys'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuth()
  return useMutation({
    meta: { silent: true },
    mutationFn: (payload) => usersApi.updateProfile(payload),
    onSuccess: ({ user }) => {
      if (user) setUser(user)
      // El listado de usuarios (si está en cache) queda marcado como obsoleto sin refetch inmediato
      queryClient.invalidateQueries({ queryKey: qk.users.all, refetchType: 'none' })
    },
  })
}
