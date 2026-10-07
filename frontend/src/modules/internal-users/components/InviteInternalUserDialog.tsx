import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { SystemRole } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  getInternalRoleDescription,
  getInternalRoleLabel,
  internalRoles,
} from '../model/internalUserPresenter'
import {
  inviteInternalUserSchema,
  type InviteInternalUserFormValues,
} from '../schemas/internalUser.schemas'

interface InviteInternalUserDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: InviteInternalUserFormValues) => Promise<boolean>
}

export function InviteInternalUserDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: InviteInternalUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<InviteInternalUserFormValues>({
    resolver: zodResolver(inviteInternalUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roles: [],
    },
  })

  const selectedRoles = useWatch({ control, name: 'roles' }) ?? []

  if (!open) return null

  const toggleRole = (role: SystemRole) => {
    const next = selectedRoles.includes(role)
      ? selectedRoles.filter((item) => item !== role)
      : [...selectedRoles, role]

    setValue('roles', next, { shouldValidate: true, shouldDirty: true })
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-internal-user-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Administración · Usuarios internos
          </p>
          <h2
            id="invite-internal-user-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Invitar usuario
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            La cuenta quedará pendiente hasta que la persona abra la invitación
            y establezca su contraseña.
          </p>
        </div>

        <div className="space-y-3.5 px-4 py-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre"
              maxLength={100}
              disabled={submitting}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Apellido"
              maxLength={100}
              disabled={submitting}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <TextField
            label="Correo electrónico"
            type="email"
            maxLength={254}
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.email?.message}
            {...register('email')}
          />

          <fieldset>
            <legend className="text-[10px] font-semibold text-slate-800">
              Roles internos
            </legend>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
              Puedes asignar más de un rol.
            </p>

            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {internalRoles.map((role) => {
                const selected = selectedRoles.includes(role)

                return (
                  <label
                    key={role}
                    className={
                      selected
                        ? 'flex cursor-pointer gap-2.5 rounded-lg border border-blue-300 bg-blue-50/70 px-3 py-2.5'
                        : 'flex cursor-pointer gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:bg-slate-50'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={submitting}
                      onChange={() => toggleRole(role)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>
                      <span className="block text-[9px] font-semibold text-slate-900">
                        {getInternalRoleLabel(role)}
                      </span>
                      <span className="mt-0.5 block text-[7px] leading-3 text-slate-400">
                        {getInternalRoleDescription(role)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {errors.roles?.message ? (
              <p className="mt-2 text-[8px] text-red-600">
                {errors.roles.message}
              </p>
            ) : null}
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Enviar invitación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
