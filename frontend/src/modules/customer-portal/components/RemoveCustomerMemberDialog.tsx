import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { CustomerMemberDto } from '../types/customerCompany.types'

interface RemoveCustomerMemberDialogProps {
  member: CustomerMemberDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function RemoveCustomerMemberDialog({
  member,
  submitting,
  error,
  onClose,
  onConfirm,
}: RemoveCustomerMemberDialogProps) {
  if (!member) return null

  const confirm = async () => {
    if (await onConfirm()) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-member-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-4 py-3.5">
          <h2
            id="remove-member-title"
            className="text-sm font-semibold text-slate-950"
          >
            Retirar miembro
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {member.firstName} {member.lastName} perderá acceso a esta empresa.
            El backend impide retirar al último administrador activo.
          </p>
        </div>

        {error ? (
          <div className="px-4 pt-3">
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] text-red-700">
              {getErrorMessage(error)}
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 px-4 py-3.5">
          <Button size="sm" variant="secondary" className="!h-7 !text-[8px]" onClick={onClose} disabled={submitting}>
            Volver
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="!h-7 !text-[8px]"
            disabled={submitting}
            onClick={() => void confirm()}
          >
            {submitting ? 'Retirando…' : 'Retirar acceso'}
          </Button>
        </div>
      </section>
    </div>
  )
}
