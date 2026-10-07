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
        className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl"
      >
        <header className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Solicitud · Cotización
          </p>
          <h2
            id="approve-quotation-title"
            className="mt-0.5 text-[15px] font-semibold tracking-tight text-slate-950"
          >
            Aprobar cotización
          </h2>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Confirma que tu empresa acepta importes, fechas y condiciones de esta revisión.
          </p>
        </header>

        <div className="px-4 py-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/45 px-3.5 py-3">
            <p className="text-[9px] font-semibold text-slate-900">
              La aprobación permitirá continuar con la siguiente etapa de la solicitud.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[8px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </div>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onClose}
            disabled={submitting}
          >
            Volver
          </Button>
          <Button
            className="!h-8 !px-3 !text-[9px]"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Aprobando…' : 'Aprobar cotización'}
          </Button>
        </footer>
      </section>
    </div>
  )
}
