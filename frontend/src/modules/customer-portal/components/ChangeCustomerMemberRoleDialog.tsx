import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { CustomerMemberDto } from '../types/customerCompany.types'
import type { CustomerMembershipRole } from '../types/customerPortal.types'

interface ChangeCustomerMemberRoleDialogProps {
  member: CustomerMemberDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (role: CustomerMembershipRole) => Promise<boolean>
}

const roles: Array<{
  value: CustomerMembershipRole
  label: string
  description: string
}> = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Gestiona empresa, miembros y solicitudes.',
  },
  {
    value: 'REQUESTER',
    label: 'Solicitante',
    description: 'Crea solicitudes y responde información.',
  },
  {
    value: 'VIEWER',
    label: 'Consulta',
    description: 'Acceso de solo lectura al portal.',
  },
]

export function ChangeCustomerMemberRoleDialog({
  member,
  submitting,
  error,
  onClose,
  onSubmit,
}: ChangeCustomerMemberRoleDialogProps) {
  const [selectedRole, setSelectedRole] =
    useState<CustomerMembershipRole>('VIEWER')

  useEffect(() => {
    if (member) setSelectedRole(member.role)
  }, [member])

  if (!member) return null

  const changed = selectedRole !== member.role

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-member-role-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Acceso de miembro
          </p>
          <h2
            id="change-member-role-title"
            className="mt-0.5 text-sm font-semibold text-slate-950"
          >
            Cambiar rol
          </h2>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            {member.firstName} {member.lastName} · {member.email}
          </p>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="grid gap-2">
            {roles.map((role) => {
              const selected = selectedRole === role.value
              const current = member.role === role.value

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={
                    selected
                      ? 'rounded-xl border border-blue-300 bg-blue-50/70 px-3 py-2.5 text-left ring-2 ring-blue-100'
                      : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold text-slate-950">
                      {role.label}
                    </p>
                    {current ? (
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] font-semibold text-slate-500 ring-1 ring-slate-200">
                        Actual
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                    {role.description}
                  </p>
                </button>
              )
            })}
          </div>

          {member.role === 'ADMIN' && selectedRole !== 'ADMIN' ? (
            <p className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-[8px] leading-4 text-amber-700">
              Si es el último administrador activo, QualityTrack impedirá el cambio.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3">
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="!h-7 !text-[8px]"
            disabled={!changed || submitting}
            onClick={() => void onSubmit(selectedRole)}
          >
            {submitting ? 'Guardando…' : 'Guardar rol'}
          </Button>
        </div>
      </section>
    </div>
  )
}
