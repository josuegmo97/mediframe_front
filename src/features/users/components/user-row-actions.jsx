import { useState } from 'react'
import { MoreHorizontal, Pencil, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/auth-provider'
import { ROLE, USER_STATUS } from '@/lib/constants'
import { toastApiError, toast } from '@/lib/toast'
import { useUpdateUser } from '../users.queries'
import { isLastActiveAdmin } from '../users.utils'

const CONFIRMS = {
  deactivate: (u) => ({ title: `Desactivar a ${u.fullname}`, description: 'No podrá iniciar sesión hasta que vuelvas a activarlo.', confirmLabel: 'Desactivar', variant: 'danger', data: { status: USER_STATUS.INACTIVE }, success: 'Usuario desactivado' }),
  activate: (u) => ({ title: `Activar a ${u.fullname}`, description: 'Podrá iniciar sesión en el panel con su usuario.', confirmLabel: 'Activar', data: { status: USER_STATUS.ACTIVE }, success: 'Usuario activado' }),
  promote: (u) => ({ title: `Hacer administrador a ${u.fullname}`, description: 'Tendrá acceso total: usuarios, licencias, instalaciones, soporte y contactos.', confirmLabel: 'Hacer administrador', data: { role: ROLE.ADMIN }, success: 'Ahora es administrador' }),
  demote: (u) => ({ title: `Quitar administrador a ${u.fullname}`, description: 'Pasará a espectador: solo podrá ver su perfil.', confirmLabel: 'Quitar administrador', variant: 'danger', data: { role: ROLE.VIEWER }, success: 'Ahora es espectador' }),
}

export function UserRowActions({ user, users, onEdit }) {
  const { user: me } = useAuth()
  const mutation = useUpdateUser()
  const [pending, setPending] = useState(null)

  const isSelf = me?._id === user._id
  const active = Number(user.status) === USER_STATUS.ACTIVE
  const admin = Number(user.role) === ROLE.ADMIN
  const lastAdmin = isLastActiveAdmin(users, user)

  const confirm = pending ? CONFIRMS[pending](user) : null

  const run = async () => {
    try {
      await mutation.mutateAsync({ id: user._id, data: confirm.data })
      toast.success(confirm.success)
      setPending(null)
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${user.fullname}`} onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem icon={<Pencil />} onSelect={() => onEdit(user)}>
            Editar
          </DropdownMenuItem>
          {!isSelf && (
            <>
              <DropdownMenuSeparator />
              {active ? (
                <DropdownMenuItem icon={<UserX />} disabled={lastAdmin} onSelect={() => setPending('deactivate')}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem icon={<UserCheck />} onSelect={() => setPending('activate')}>
                  Activar
                </DropdownMenuItem>
              )}
              {admin ? (
                <DropdownMenuItem icon={<ShieldOff />} disabled={lastAdmin} onSelect={() => setPending('demote')}>
                  Quitar administrador
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem icon={<ShieldCheck />} onSelect={() => setPending('promote')}>
                  Hacer administrador
                </DropdownMenuItem>
              )}
              {lastAdmin && <p className="px-3 py-1.5 text-xs text-fg-subtle">Es el único administrador activo.</p>}
            </>
          )}
          {isSelf && <p className="px-3 py-1.5 text-xs text-fg-subtle">No puedes cambiar tu propio rol o estado.</p>}
        </DropdownMenuContent>
      </DropdownMenu>

      {confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant ?? 'default'}
          loading={mutation.isPending}
          onConfirm={run}
        />
      )}
    </>
  )
}
