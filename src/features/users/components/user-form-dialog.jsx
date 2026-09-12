import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wand2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/auth-provider'
import { applyFieldErrors, normalizeApiError } from '@/lib/api-error'
import { ROLE, USER_STATUS } from '@/lib/constants'
import { toast } from '@/lib/toast'
import { createUserSchema, updateUserSchema } from '../schemas'
import { useCreateUser, useUpdateUser } from '../users.queries'
import { diffUser, findDuplicate, generatePassword, isLastActiveAdmin } from '../users.utils'

const ROLE_OPTIONS = [
  { value: String(ROLE.VIEWER), label: 'Espectador (solo su perfil)' },
  { value: String(ROLE.ADMIN), label: 'Administrador' },
]
const STATUS_OPTIONS = [
  { value: String(USER_STATUS.ACTIVE), label: 'Activo' },
  { value: String(USER_STATUS.INACTIVE), label: 'Pendiente / inactivo' },
]

function defaultsFor(user) {
  if (!user) return { username: '', fullname: '', email: '', password: '', role: String(ROLE.VIEWER), status: String(USER_STATUS.ACTIVE) }
  return { fullname: user.fullname ?? '', email: user.email ?? '', password: '', role: String(user.role), status: String(user.status) }
}

/** Crear (registro + ajuste de rol/estado) o editar usuario. */
export function UserFormDialog({ open, onOpenChange, user = null, users = [] }) {
  const isEdit = Boolean(user)
  const { user: me } = useAuth()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const isSelf = isEdit && me?._id === user._id
  const lastAdmin = isEdit && isLastActiveAdmin(users, user)
  const lockRoleStatus = isSelf || lastAdmin

  const resolver = useMemo(() => zodResolver(isEdit ? updateUserSchema : createUserSchema), [isEdit])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver, defaultValues: defaultsFor(user) })

  useEffect(() => {
    if (open) reset(defaultsFor(user))
  }, [open, user, reset])

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending

  const onSubmit = async (values) => {
    const duplicate = findDuplicate(users, { username: isEdit ? '' : values.username, email: values.email }, user?._id)
    if (duplicate) {
      setError(duplicate.field, { type: 'manual', message: duplicate.message })
      return
    }

    try {
      if (isEdit) {
        const payload = diffUser(user, values)
        if (!Object.keys(payload).length) {
          toast.info('No hay cambios para guardar')
          onOpenChange(false)
          return
        }
        await updateMutation.mutateAsync({ id: user._id, data: payload })
        toast.success('Usuario actualizado')
      } else {
        const result = await createMutation.mutateAsync({
          username: values.username.trim().toLowerCase(),
          fullname: values.fullname.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          status: values.status,
        })
        if (result.partial) {
          toast.warning('Usuario creado, pero no se pudo asignar rol/estado. Edítalo desde la lista.', { duration: 7000 })
        } else {
          toast.success(`Usuario ${result.user.username} creado`)
        }
      }
      onOpenChange(false)
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyFieldErrors(setError, normalized, ['username', 'fullname', 'email', 'password', 'role', 'status'])) {
        setError('root', { message: normalized.message })
      }
    }
  }

  const passwordValue = watch('password')

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>
              {isEdit ? `@${user.username}` : 'La cuenta se crea activa con el rol que elijas. Comparte la contraseña con la persona.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
            {lockRoleStatus && (
              <Alert variant="info">
                {isSelf ? 'No puedes cambiar tu propio rol o estado.' : 'Es el único administrador activo: su rol y estado no se pueden cambiar.'}
              </Alert>
            )}

            {!isEdit && (
              <FormField label="Usuario" required hint="Letras, números y guion bajo. Se guarda en minúsculas." error={errors.username?.message}>
                <Input id="uf-username" autoCapitalize="none" autoComplete="off" spellCheck={false} placeholder="nombre_apellido" {...register('username')} />
              </FormField>
            )}

            <FormField label="Nombre completo" required error={errors.fullname?.message}>
              <Input id="uf-fullname" autoComplete="off" placeholder="Nombre y apellido" {...register('fullname')} />
            </FormField>

            <FormField label="Correo" hint={isEdit && user.email ? 'Para quitar el correo, la API no lo permite; solo puedes cambiarlo.' : 'Opcional'} error={errors.email?.message}>
              <Input id="uf-email" type="email" inputMode="email" autoComplete="off" placeholder="correo@ejemplo.com" {...register('email')} />
            </FormField>

            <FormField
              label={isEdit ? 'Nueva contraseña' : 'Contraseña'}
              required={!isEdit}
              hint={isEdit ? 'Déjala vacía para mantener la actual.' : 'Mínimo 6 caracteres.'}
              error={errors.password?.message}
              labelExtra={
                <Button type="button" variant="link" size="sm" className="h-auto text-xs" onClick={() => setValue('password', generatePassword(), { shouldDirty: true, shouldValidate: true })} leftIcon={<Wand2 className="h-3.5 w-3.5" />}>
                  Generar
                </Button>
              }
            >
              <PasswordInput id="uf-password" autoComplete="new-password" placeholder={isEdit ? '••••••••' : 'Contraseña inicial'} {...register('password')} />
            </FormField>
            {passwordValue && !isEdit && <p className="-mt-3 text-xs text-fg-subtle">Anota la contraseña: no se vuelve a mostrar.</p>}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Rol" error={errors.role?.message}>
                <Select id="uf-role" options={ROLE_OPTIONS} disabled={lockRoleStatus} {...register('role')} />
              </FormField>
              <FormField label="Estado" error={errors.status?.message}>
                <Select id="uf-status" options={STATUS_OPTIONS} disabled={lockRoleStatus} {...register('status')} />
              </FormField>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
