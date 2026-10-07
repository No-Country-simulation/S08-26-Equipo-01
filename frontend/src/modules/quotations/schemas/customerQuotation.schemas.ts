import { z } from 'zod'

export const customerAdjustmentSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(1, 'Describe el ajuste que necesitas.')
    .max(2000, 'La solicitud no puede superar 2000 caracteres.'),
})

export const customerRejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(2000, 'El motivo no puede superar 2000 caracteres.'),
})

export type CustomerAdjustmentFormValues = z.infer<
  typeof customerAdjustmentSchema
>
export type CustomerRejectionFormValues = z.infer<
  typeof customerRejectionSchema
>
