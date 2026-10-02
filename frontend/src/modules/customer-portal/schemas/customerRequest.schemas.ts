import { z } from 'zod'

const today = () => new Date().toISOString().slice(0, 10)

export const customerRequestFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Indica el nombre del trabajo.')
      .max(200, 'El nombre no puede superar 200 caracteres.'),
    description: z
      .string()
      .trim()
      .min(1, 'Describe el trabajo solicitado.')
      .max(5000, 'La descripción no puede superar 5000 caracteres.'),
    quantity: z
      .number()
      .int('La cantidad debe ser un entero.')
      .positive('La cantidad debe ser mayor a cero.'),
    requestedDeliveryDate: z
      .string()
      .refine(
        (value) => !value || value >= today(),
        'La fecha requerida no puede estar en el pasado.',
      ),
    customerReference: z
      .string()
      .max(120, 'La referencia no puede superar 120 caracteres.'),
    materialRequirementType: z.enum(['SPECIFIED', 'ASSISTANCE_REQUIRED']),
    materialRequirement: z
      .string()
      .trim()
      .min(1, 'Indica el material o el contexto para recibir asesoría.')
      .max(2000, 'El requisito técnico no puede superar 2000 caracteres.'),
    deliveryMode: z.enum([
      'SAVED_ADDRESS',
      'CUSTOM_ADDRESS',
      'CUSTOMER_PICKUP',
      'DEFINE_LATER',
    ]),
    customerAddressId: z.string(),
    deliveryLabel: z.string().max(120, 'El nombre no puede superar 120 caracteres.'),
    deliveryAddress: z.string().max(300, 'La dirección no puede superar 300 caracteres.'),
    deliveryCity: z.string().max(120, 'La ciudad no puede superar 120 caracteres.'),
    deliveryState: z.string().max(120, 'El estado no puede superar 120 caracteres.'),
    deliveryPostalCode: z.string().max(20, 'El código postal no puede superar 20 caracteres.'),
    deliveryCountry: z.string().max(100, 'El país no puede superar 100 caracteres.'),
    deliveryContactName: z.string().max(160, 'El contacto no puede superar 160 caracteres.'),
    deliveryContactPhone: z.string().max(30, 'El teléfono no puede superar 30 caracteres.'),
    deliveryInstructions: z.string().max(1000, 'Las indicaciones no pueden superar 1000 caracteres.'),
  })
  .superRefine((values, context) => {
    if (values.deliveryMode === 'SAVED_ADDRESS' && !values.customerAddressId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customerAddressId'],
        message: 'Selecciona una dirección de la empresa.',
      })
    }

    if (values.deliveryMode === 'CUSTOM_ADDRESS') {
      const required = [
        ['deliveryAddress', values.deliveryAddress, 'Indica la dirección.'],
        ['deliveryCity', values.deliveryCity, 'Indica la ciudad.'],
        ['deliveryState', values.deliveryState, 'Indica el estado.'],
        ['deliveryPostalCode', values.deliveryPostalCode, 'Indica el código postal.'],
        ['deliveryCountry', values.deliveryCountry, 'Indica el país.'],
      ] as const

      required.forEach(([field, value, message]) => {
        if (!value.trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message,
          })
        }
      })
    }
  })

export const respondInformationSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1, 'La respuesta es obligatoria.')
    .max(4000, 'La respuesta no puede superar 4000 caracteres.'),
})

export const cancelCustomerRequestSchema = z.object({
  reason: z.string().max(1000, 'El motivo no puede superar 1000 caracteres.'),
})

export const requestDocumentSchema = z.object({
  name: z.string().max(180, 'El nombre no puede superar 180 caracteres.'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar 500 caracteres.'),
})

export type CustomerRequestFormValues = z.infer<
  typeof customerRequestFormSchema
>
export type RespondInformationFormValues = z.infer<
  typeof respondInformationSchema
>
export type CancelCustomerRequestFormValues = z.infer<
  typeof cancelCustomerRequestSchema
>
export type RequestDocumentFormValues = z.infer<typeof requestDocumentSchema>
