import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'
import type { QuotationDto } from '../types/quotation.types'

interface QuotationRevisionHistoryProps {
  revisions: QuotationDto[]
  currentId: number
}

export function QuotationRevisionHistory({
  revisions,
  currentId,
}: QuotationRevisionHistoryProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Historial comercial
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Revisiones de la cotización
          </h2>
        </div>
        <span className="text-[8px] text-slate-400">
          {revisions.length} revisiones
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {revisions.map((revision) => {
          const status = getQuotationStatusPresentation(revision.status)
          const current = revision.id === currentId

          return (
            <Link
              key={revision.id}
              to={`/quotations/${revision.id}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-blue-50/30"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-900">
                  Revisión {revision.revision}
                  {current ? ' · Actual' : ''}
                </p>
                <p className="mt-0.5 truncate text-[8px] text-slate-400">
                  {revision.quotationNumber}
                </p>
              </div>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                {status.label}
              </Badge>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
