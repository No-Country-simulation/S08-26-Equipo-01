import { z } from 'zod'
import { internalRoles } from '../model/internalUserPresenter'

export const inviteInternalUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar 100 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede superar 100 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo válido.')
    .max(254, 'El correo no puede superar 254 caracteres.'),
  roles: z
    .array(z.enum(internalRoles))
    .min(1, 'Selecciona al menos un rol.'),
})

export type InviteInternalUserFormValues = z.infer<
  typeof inviteInternalUserSchema
>
