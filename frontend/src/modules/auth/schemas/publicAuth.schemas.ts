import { z } from 'zod'

const passwordByteLength = (value: string) =>
  new TextEncoder().encode(value).byteLength

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe contener al menos 8 caracteres.')
  .refine((value) => passwordByteLength(value) <= 72, {
    message: 'La contraseña no puede superar los 72 bytes.',
  })

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo electrónico.')
  .email('Ingresa un correo electrónico válido.')
  .max(254, 'El correo electrónico es demasiado largo.')

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}.`)
    .max(100, `${label} no puede exceder los 100 caracteres.`)

export const registerSchema = z
  .object({
    firstName: nameSchema('tu nombre'),
    lastName: nameSchema('tu apellido'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })

export const emailActionSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })

export const customerInvitationRegistrationSchema = z
  .object({
    firstName: nameSchema('tu nombre'),
    lastName: nameSchema('tu apellido'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })

export const internalInvitationActivationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
export type EmailActionFormValues = z.infer<typeof emailActionSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type CustomerInvitationRegistrationFormValues = z.infer<
  typeof customerInvitationRegistrationSchema
>
export type InternalInvitationActivationFormValues = z.infer<
  typeof internalInvitationActivationSchema
>
