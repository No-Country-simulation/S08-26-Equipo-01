import { z } from 'zod'

export const ownProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede exceder los 100 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede exceder los 100 caracteres.'),
})

export const internalProfileSchema = ownProfileSchema

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria.'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe contener al menos 8 caracteres.'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma la nueva contraseña.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type OwnProfileFormValues = z.infer<typeof ownProfileSchema>
export type InternalProfileFormValues = OwnProfileFormValues
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
