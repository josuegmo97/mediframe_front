import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth.api'
import * as usersApi from '@/api/users.api'
import { useAuth } from '@/features/auth/auth-provider'
import { ROLE, USER_STATUS } from '@/lib/constants'
import { qk } from '@/lib/query-keys'

const MINUTE = 60_000
const EMPTY = []

export function useUsersQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.users.list(),
    queryFn: usersApi.listUsers,
    select: (data) => data?.users ?? EMPTY,
    staleTime: 2 * MINUTE,
    gcTime: 30 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useUserStatsQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.users.stats(),
    queryFn: usersApi.getUserStats,
    select: (data) => data?.stats ?? null,
    staleTime: 2 * MINUTE,
    gcTime: 30 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

/**
 * La API no tiene "crear usuario" para admins: se registra (público, queda inactivo/espectador)
 * y luego se ajusta rol/estado con PUT /users/:id. Si el segundo paso falla, el usuario existe
 * igual y se devuelve `partial: true` para avisar.
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: async ({ username, fullname, email, password, role, status }) => {
      const { user } = await authApi.register({ username, fullname, email: email || undefined, password })
      const wantsRole = Number(role)
      const wantsStatus = Number(status)
      if (wantsRole === ROLE.VIEWER && wantsStatus === USER_STATUS.INACTIVE) return { user, partial: false }
      try {
        const updated = await usersApi.updateUser(user._id, { role: wantsRole, status: wantsStatus })
        return { user: updated.user, partial: false }
      } catch (error) {
        return { user, partial: true, error }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.users.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { user: me, setUser } = useAuth()
  return useMutation({
    meta: { silent: true },
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    onSuccess: ({ user }) => {
      if (!user) return
      queryClient.setQueryData(qk.users.list(), (old) =>
        old ? { ...old, users: (old.users ?? []).map((item) => (item._id === user._id ? user : item)) } : old
      )
      queryClient.invalidateQueries({ queryKey: qk.users.stats() })
      if (me && user._id === me._id) setUser(user)
    },
  })
}
