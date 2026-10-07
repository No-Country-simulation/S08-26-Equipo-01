import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { CustomerInvitationDto } from '../types/customerCompany.types'

interface CancelCustomerInvitationDialogProps {
  invitation: CustomerInvitationDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function CancelCustomerInvitationDialog({
  invitation,
  submitting,
  error,
  onClose,
  onConfirm,
}: CancelCustomerInvitationDialogProps) {
  if (!invitation) return null

  const confirm = async () => {
    if (await onConfirm()) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-invitation-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-4 py-3.5">
          <h2
            id="cancel-invitation-title"
            className="text-sm font-semibold text-slate-950"
          >
            Cancelar invitación
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {invitation.email} ya no podrá usar el enlace enviado para unirse a
            esta empresa.
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
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Volver
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="!h-7 !text-[8px]"
            disabled={submitting}
            onClick={() => void confirm()}
          >
            {submitting ? 'Cancelando…' : 'Cancelar invitación'}
          </Button>
        </div>
      </section>
    </div>
  )
}
