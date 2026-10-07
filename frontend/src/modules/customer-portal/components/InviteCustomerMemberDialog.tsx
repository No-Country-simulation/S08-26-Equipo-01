import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  customerInvitationSchema,
  type CustomerInvitationFormValues,
} from '../schemas/customerCompany.schemas'

interface InviteCustomerMemberDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CustomerInvitationFormValues) => Promise<boolean>
}

const roles = [
  {
    value: 'ADMIN' as const,
    label: 'Administrador',
    description: 'Gestiona empresa, miembros y solicitudes.',
  },
  {
    value: 'REQUESTER' as const,
    label: 'Solicitante',
    description: 'Crea solicitudes y responde información.',
  },
  {
    value: 'VIEWER' as const,
    label: 'Consulta',
    description: 'Acceso de solo lectura al portal.',
  },
]

export function InviteCustomerMemberDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: InviteCustomerMemberDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CustomerInvitationFormValues>({
    resolver: zodResolver(customerInvitationSchema),
    defaultValues: { email: '', role: 'REQUESTER' },
  })

  const selectedRole = useWatch({ control, name: 'role' })

  if (!open) return null

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
        aria-labelledby="invite-member-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Empresa / Miembros
          </p>
          <h2
            id="invite-member-title"
            className="mt-0.5 text-sm font-semibold text-slate-950"
          >
            Invitar miembro
          </h2>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Se enviará una invitación al correo indicado.
          </p>
        </div>

        <div className="space-y-4 px-4 py-4">
          <TextField
            label="Correo electrónico"
            type="email"
            maxLength={254}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <p className="mb-2 text-[10px] font-semibold text-slate-800">Acceso</p>
            <div className="grid gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() =>
                    setValue('role', role.value, { shouldValidate: true })
                  }
                  className={
                    selectedRole === role.value
                      ? 'rounded-xl border border-blue-300 bg-blue-50/70 px-3 py-2.5 text-left ring-2 ring-blue-100'
                      : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  <p className="text-[10px] font-semibold text-slate-950">
                    {role.label}
                  </p>
                  <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                    {role.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3">
          <Button size="sm" variant="secondary" className="!h-7 !text-[8px]" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" className="!h-7 !text-[8px]" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar invitación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
