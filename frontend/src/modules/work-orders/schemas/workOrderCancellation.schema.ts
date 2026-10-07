import { z } from 'zod'

export const cancelWorkOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(2000, 'El motivo no puede superar 2000 caracteres.'),
})

export type CancelWorkOrderFormValues = z.infer<
  typeof cancelWorkOrderSchema
>
