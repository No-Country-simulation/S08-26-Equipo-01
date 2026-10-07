import { z } from 'zod'

export const customerCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre de la empresa es obligatorio.')
    .max(200, 'El nombre no puede superar 200 caracteres.'),
  rfc: z.string().max(50, 'El RFC no puede superar 50 caracteres.'),
  phone: z.string().max(30, 'El teléfono no puede superar 30 caracteres.'),
  administrativeEmail: z
    .string()
    .max(254, 'El correo no puede superar 254 caracteres.')
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      'Ingresa un correo válido.',
    ),
  city: z.string().max(120, 'La ciudad no puede superar 120 caracteres.'),
  state: z.string().max(120, 'El estado no puede superar 120 caracteres.'),
  website: z.string().max(255, 'El sitio no puede superar 255 caracteres.'),
})

export const customerInvitationSchema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.').max(254),
  role: z.enum(['ADMIN', 'REQUESTER', 'VIEWER']),
})

export type CustomerCompanyFormValues = z.infer<typeof customerCompanySchema>
export type CustomerInvitationFormValues = z.infer<
  typeof customerInvitationSchema
>


export const customerAddressSchema = z.object({
  label: z.string().trim().min(1, 'Indica un nombre para la dirección.').max(120),
  address: z.string().trim().min(1, 'Indica la dirección.').max(300),
  city: z.string().trim().min(1, 'Indica la ciudad.').max(120),
  state: z.string().trim().min(1, 'Indica el estado.').max(120),
  postalCode: z.string().trim().min(1, 'Indica el código postal.').max(20),
  country: z.string().trim().min(1, 'Indica el país.').max(100),
  contactName: z.string().max(160),
  contactPhone: z.string().max(30),
  deliveryInstructions: z.string().max(1000),
  defaultAddress: z.boolean(),
})

export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>
