import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationAdjustmentCardProps {
  quotation: QuotationDetailDto
}

export function QuotationAdjustmentCard({
  quotation,
}: QuotationAdjustmentCardProps) {
  if (!quotation.adjustmentNotes) return null

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_10px_28px_-26px_rgba(146,64,14,0.22)]">
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50/80 px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-700">
          Solicitud de ajuste del cliente
        </p>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[10px] leading-4 text-slate-700">
          {quotation.adjustmentNotes}
        </p>

        {quotation.adjustmentResponse ? (
          <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Respuesta enviada
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-600">
              {quotation.adjustmentResponse}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
