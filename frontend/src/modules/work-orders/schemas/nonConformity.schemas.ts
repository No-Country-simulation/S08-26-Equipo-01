import { z } from 'zod'

export const nonConformityDetailsSchema = z.object({
  affectedQuantity: z
    .number()
    .int('La cantidad afectada debe ser un entero.')
    .positive('La cantidad afectada debe ser mayor a cero.'),
  severity: z
    .string()
    .trim()
    .min(1, 'Indica la severidad.')
    .max(50, 'La severidad no puede superar 50 caracteres.'),
  description: z
    .string()
    .trim()
    .min(1, 'Describe la no conformidad.')
    .max(4000, 'La descripción no puede superar 4000 caracteres.'),
})

export const useAsIsSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'La concesión necesita una justificación.')
    .max(4000, 'La justificación no puede superar 4000 caracteres.'),
})

export type NonConformityDetailsFormValues = z.infer<
  typeof nonConformityDetailsSchema
>
export type UseAsIsFormValues = z.infer<typeof useAsIsSchema>
