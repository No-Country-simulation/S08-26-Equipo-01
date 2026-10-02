import { z } from 'zod'

const passwordByteLength = (value: string) =>
  new TextEncoder().encode(value).byteLength

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('Ingresa un correo electrónico válido.')
    .max(254, 'El correo electrónico es demasiado largo.'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
    .refine((value) => passwordByteLength(value) <= 72, {
      message: 'La contraseña no puede superar los 72 bytes.',
    }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
