import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationAdjustmentNoticeProps {
  quotation: CustomerQuotationDetailDto
}

export function CustomerQuotationAdjustmentNotice({
  quotation,
}: CustomerQuotationAdjustmentNoticeProps) {
  const adjustment = quotation.adjustment

  if (!adjustment) return null

  if (quotation.customerStatus === 'ADJUSTMENT_REQUESTED') {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Ajuste solicitado
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Nueva revisión en preparación
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-700">
          {adjustment.notes}
        </p>
        <p className="mt-2 text-[11px] font-medium text-amber-800">
          Respuesta comercial: pendiente.
        </p>
      </section>
    )
  }

  if (adjustment.notes || adjustment.response) {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          Respuesta al ajuste incluida
        </p>
        {adjustment.notes ? (
          <div className="mt-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Tu solicitud
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700">
              {adjustment.notes}
            </p>
          </div>
        ) : null}
        {adjustment.response ? (
          <div className="mt-3 rounded-lg bg-white/70 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Respuesta comercial
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700">
              {adjustment.response}
            </p>
          </div>
        ) : null}
      </section>
    )
  }

  return null
}
