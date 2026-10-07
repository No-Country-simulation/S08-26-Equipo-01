import { z } from 'zod'

export const workOrderPlanningSchema = z.object({
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  plannedStartDate: z.string().min(1, 'Selecciona la fecha de inicio.'),
  plannedEndDate: z.string().min(1, 'Selecciona la fecha de fin.'),
})

export const routingOperationSchema = z.object({
  sequenceNumber: z
    .number()
    .int('La secuencia debe ser un entero.')
    .positive('La secuencia debe ser mayor a cero.'),
  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(40, 'El código no puede superar 40 caracteres.'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(150, 'El nombre no puede superar 150 caracteres.'),
  instructions: z.string(),
  estimatedMinutes: z
    .number()
    .int('El tiempo debe ser un entero.')
    .positive('El tiempo estimado debe ser mayor a cero.'),
  prerequisiteOperationIds: z.array(z.number().int().positive()),
  resequenceOperations: z.boolean(),
})

export const reopenRoutingSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Indica el motivo de la reapertura.')
    .max(1000, 'El motivo no puede superar 1000 caracteres.'),
})

export type WorkOrderPlanningFormValues = z.infer<
  typeof workOrderPlanningSchema
>
export type RoutingOperationFormValues = z.infer<typeof routingOperationSchema>
export type ReopenRoutingFormValues = z.infer<typeof reopenRoutingSchema>
