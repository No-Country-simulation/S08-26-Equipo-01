import type { ReactNode } from 'react'
import { Button } from '@/shared/components/ui/Button'

interface WorkOrderSecondaryDialogProps {
  open: boolean
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function WorkOrderSecondaryDialog({
  open,
  eyebrow,
  title,
  description,
  children,
  onClose,
}: WorkOrderSecondaryDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-order-secondary-title"
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              {eyebrow}
            </p>
            <h2
              id="work-order-secondary-title"
              className="mt-1 text-[15px] font-semibold text-slate-950"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[9px] leading-4 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4">
          {children}
        </div>
      </section>
    </div>
  )
}
