import { z } from 'zod'

export const startOperationExecutionSchema = z.object({
  machineId: z.string(),
  startNotes: z
    .string()
    .max(2000, 'Las notas no pueden superar 2000 caracteres.'),
})

export const completeOperationExecutionSchema = z.object({
  quantityProcessed: z
    .number()
    .int('La cantidad procesada debe ser un entero.')
    .positive('La cantidad procesada debe ser mayor a cero.'),
  quantityAccepted: z
    .number()
    .int('La cantidad aceptada debe ser un entero.')
    .min(0, 'La cantidad aceptada no puede ser negativa.'),
  quantityRejected: z
    .number()
    .int('La cantidad rechazada debe ser un entero.')
    .min(0, 'La cantidad rechazada no puede ser negativa.'),
  completionNotes: z
    .string()
    .max(2000, 'Las notas no pueden superar 2000 caracteres.'),
})

export const cancelOperationExecutionSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, 'Indica el motivo de cancelación.')
    .max(1000, 'El motivo no puede superar 1000 caracteres.'),
})

export const materialConsumptionSchema = z.object({
  quantityUsed: z
    .number()
    .positive('La cantidad debe ser mayor a cero.')
    .min(0.001, 'La cantidad mínima es 0.001.'),
})

export type StartOperationExecutionFormValues = z.infer<
  typeof startOperationExecutionSchema
>
export type CompleteOperationExecutionFormValues = z.infer<
  typeof completeOperationExecutionSchema
>
export type CancelOperationExecutionFormValues = z.infer<
  typeof cancelOperationExecutionSchema
>
export type MaterialConsumptionFormValues = z.infer<
  typeof materialConsumptionSchema
>
