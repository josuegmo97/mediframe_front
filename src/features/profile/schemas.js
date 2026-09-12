import { z } from 'zod'
import { fullnameSchema, optionalEmailSchema, passwordSchema } from '@/features/auth/schemas'

export const profileSchema = z.object({
  fullname: fullnameSchema,
  email: optionalEmailSchema,
})

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
