import { z } from 'zod'

export const createMachineSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(50, 'El código no puede superar 50 caracteres.'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(255, 'El nombre no puede superar 255 caracteres.'),
  type: z
    .string()
    .trim()
    .max(255, 'El tipo no puede superar 255 caracteres.'),
})

export type CreateMachineFormValues = z.infer<typeof createMachineSchema>

export const createMaterialSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(50, 'El código no puede superar 50 caracteres.'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(255, 'El nombre no puede superar 255 caracteres.'),
  specification: z
    .string()
    .trim()
    .max(500, 'La especificación no puede superar 500 caracteres.'),
  unit: z
    .string()
    .trim()
    .min(1, 'La unidad es obligatoria.')
    .max(20, 'La unidad no puede superar 20 caracteres.'),
})

export type CreateMaterialFormValues = z.infer<typeof createMaterialSchema>

export const createMaterialLotSchema = z.object({
  lotNumber: z
    .string()
    .trim()
    .min(1, 'El número de lote es obligatorio.')
    .max(100, 'El número de lote no puede superar 100 caracteres.'),
  supplier: z
    .string()
    .trim()
    .max(255, 'El proveedor no puede superar 255 caracteres.'),
  receivedAt: z.string().refine(
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
    'Ingresa una fecha de recepción válida.',
  ),
  quantityReceived: z
    .number({ error: 'Ingresa una cantidad válida.' })
    .min(0.001, 'La cantidad debe ser al menos 0.001.'),
})

export type CreateMaterialLotFormValues = z.infer<
  typeof createMaterialLotSchema
>
