import { z } from 'zod'

export const createDeliverySchema = z.object({
  quantity: z
    .number()
    .int('La cantidad debe ser un entero.')
    .positive('La cantidad debe ser mayor a cero.'),
  destinationLabel: z.string().max(120, 'El nombre del destino no puede superar 120 caracteres.'),
  destinationContactName: z
    .string()
    .max(160, 'El contacto no puede superar 160 caracteres.'),
  destinationAddress: z
    .string()
    .trim()
    .min(1, 'Indica la dirección.')
    .max(300, 'La dirección no puede superar 300 caracteres.'),
  destinationCity: z
    .string()
    .trim()
    .min(1, 'Indica la ciudad.')
    .max(120, 'La ciudad no puede superar 120 caracteres.'),
  destinationState: z
    .string()
    .trim()
    .min(1, 'Indica el estado.')
    .max(120, 'El estado no puede superar 120 caracteres.'),
  destinationPostalCode: z
    .string()
    .trim()
    .min(1, 'Indica el código postal.')
    .max(20, 'El código postal no puede superar 20 caracteres.'),
  destinationCountry: z
    .string()
    .trim()
    .min(1, 'Indica el país.')
    .max(100, 'El país no puede superar 100 caracteres.'),
  destinationInstructions: z
    .string()
    .max(1000, 'Las indicaciones no pueden superar 1000 caracteres.'),
  deliveryMethod: z
    .string()
    .trim()
    .min(1, 'Indica el método de entrega.')
    .max(80, 'El método no puede superar 80 caracteres.'),
})

export const dispatchDeliverySchema = z.object({
  carrier: z
    .string()
    .max(120, 'El transportista no puede superar 120 caracteres.'),
  trackingNumber: z
    .string()
    .max(160, 'La guía no puede superar 160 caracteres.'),
})

export const completeDeliverySchema = z.object({
  receivedByName: z
    .string()
    .trim()
    .min(1, 'Indica quién recibió.')
    .max(160, 'El nombre no puede superar 160 caracteres.'),
  deliveredAt: z.string().min(1, 'Indica la fecha real de entrega.'),
  evidenceDocumentVersionId: z.string(),
})

export const attachDeliveryEvidenceSchema = z.object({
  documentVersionId: z.string().min(1, 'Selecciona una evidencia.'),
})

export const cancelDeliverySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Indica el motivo de cancelación.')
    .max(1000, 'El motivo no puede superar 1000 caracteres.'),
})

export type CreateDeliveryFormValues = z.infer<typeof createDeliverySchema>
export type DispatchDeliveryFormValues = z.infer<typeof dispatchDeliverySchema>
export type CompleteDeliveryFormValues = z.infer<typeof completeDeliverySchema>
export type AttachDeliveryEvidenceFormValues = z.infer<
  typeof attachDeliveryEvidenceSchema
>
export type CancelDeliveryFormValues = z.infer<typeof cancelDeliverySchema>
