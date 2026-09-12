import { z } from 'zod'

export const createLicenseSchema = z.object({
  mode: z.enum(['single', 'batch']),
  quantity: z.coerce.number({ invalid_type_error: 'Ingresa una cantidad' }).int('Debe ser un número entero').min(1, 'Mínimo 1 licencia').max(100, 'Máximo 100 licencias por lote'),
  days_permission: z.coerce.number({ invalid_type_error: 'Ingresa los días' }).int('Debe ser un número entero').min(1, 'Mínimo 1 día').max(365, 'Máximo 365 días'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
})
