import { z } from 'zod'

/** Entero ≥ min o vacío (→ null = sin límite). Los inputs llegan como string. */
const optionalInt = (min, label) =>
  z
    .union([z.literal(''), z.coerce.number().int(`${label} debe ser un entero`).min(min, `${label} debe ser ≥ ${min}`)])
    .transform((v) => (v === '' ? null : v))

const requiredInt = (min, label) => z.coerce.number({ invalid_type_error: `${label} es requerido` }).int(`${label} debe ser un entero`).min(min, `${label} debe ser ≥ ${min}`)

export const settingsSchema = z.object({
  enabled: z.boolean(),
  default_device_enabled: z.boolean(),
  default_limit: optionalInt(0, 'El límite'),
  period: z.enum(['monthly', 'daily'], { errorMap: () => ({ message: 'Período inválido' }) }),
  max_duration_seconds: requiredInt(1, 'La duración máxima'),
  max_audio_mb: z.coerce.number({ invalid_type_error: 'El tamaño máximo es requerido' }).min(0.01, 'El tamaño máximo debe ser mayor a 0'),
})

export const deviceSchema = z.object({
  enabled: z.boolean(),
  blocked_by_admin: z.boolean(),
  limit_override: optionalInt(0, 'El límite'),
  notes: z.string().max(2000, 'Máximo 2000 caracteres'),
})
