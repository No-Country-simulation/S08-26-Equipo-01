import { z } from 'zod'

export const createRequestSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  quantity: z
    .number({ error: 'La cantidad es obligatoria' })
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0'),
  requestDeliveryDate: z.string().min(1, 'La fecha es obligatoria'),
})

export type CreateRequestFormValues = z.infer<typeof createRequestSchema>