import { z } from 'zod'

export const cancelQuotationSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(2000, 'El motivo no puede superar 2000 caracteres.'),
})

export type CancelQuotationFormValues = z.infer<typeof cancelQuotationSchema>
