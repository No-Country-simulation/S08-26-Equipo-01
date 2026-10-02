import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'

interface ApproveQuotationDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => void
}

export function ApproveQuotationDialog({
  open,
  submitting,
  error,
  onClose,
  onConfirm,
}: ApproveQuotationDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-quotation-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="approve-quotation-title"
          className="text-lg font-semibold text-slate-950"
        >
          Aprobar cotización
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confirma que tu empresa acepta los importes, fechas y condiciones de
          esta revisión.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {getErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Volver
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Aprobando…' : 'Aprobar cotización'}
          </Button>
        </div>
      </section>
    </div>
  )
}
