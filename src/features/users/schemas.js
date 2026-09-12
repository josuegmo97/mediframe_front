import { z } from 'zod'
import { fullnameSchema, optionalEmailSchema, passwordSchema, usernameSchema } from '@/features/auth/schemas'

const roleSchema = z.coerce.number().int().refine((v) => v === 1 || v === 2, 'Rol inválido')
const statusSchema = z.coerce.number().int().refine((v) => v === 0 || v === 1, 'Estado inválido')

export const createUserSchema = z.object({
  username: usernameSchema,
  fullname: fullnameSchema,
  email: optionalEmailSchema,
  password: passwordSchema,
  role: roleSchema,
  status: statusSchema,
})

export const updateUserSchema = z.object({
  fullname: fullnameSchema,
  email: optionalEmailSchema,
  password: z.union([z.literal(''), passwordSchema]),
  role: roleSchema,
  status: statusSchema,
})
