import { z } from 'zod'

/** Espejo exacto de las reglas del backend: evita 400 que consumen el limiter de /api/auth. */
export const usernameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un nombre de usuario')
  .min(3, 'Mínimo 3 caracteres')
  .max(30, 'Máximo 30 caracteres')
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo')

export const passwordSchema = z.string().min(1, 'Ingresa una contraseña').min(6, 'Mínimo 6 caracteres').max(128, 'Máximo 128 caracteres')

export const fullnameSchema = z.string().trim().min(1, 'Ingresa el nombre completo').min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres')

export const optionalEmailSchema = z.union([z.literal(''), z.string().trim().email('Ingresa un correo válido').max(200, 'Máximo 200 caracteres')])

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa tu usuario').min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(1, 'Ingresa tu contraseña').min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    username: usernameSchema,
    fullname: fullnameSchema,
    email: optionalEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
