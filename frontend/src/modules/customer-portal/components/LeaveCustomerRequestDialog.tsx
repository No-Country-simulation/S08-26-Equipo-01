import { Button } from '@/shared/components/ui/Button'

interface LeaveCustomerRequestDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LeaveCustomerRequestDialog({
  open,
  onClose,
  onConfirm,
}: LeaveCustomerRequestDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-request-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M12 8v5" />
                <path d="M12 17h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-amber-700">
                Cambios sin guardar
              </p>
              <h2
                id="leave-request-title"
                className="mt-0.5 text-sm font-semibold text-slate-950"
              >
                ¿Salir de la nueva solicitud?
              </h2>
              <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                Los datos que has capturado todavía no se han guardado.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={onClose}
            className="!h-8 !px-3 !text-[10px]"
          >
            Seguir editando
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={onConfirm}
            className="!h-8 !px-3 !text-[10px]"
          >
            Salir sin guardar
          </Button>
        </div>
      </section>
    </div>
  )
}
