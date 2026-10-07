import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import type { CustomerQuotationSummaryDto } from '../types/customerQuotation.types'

interface CustomerQuotationRevisionHistoryProps {
  customerId: number
  currentId: number
  revisions: CustomerQuotationSummaryDto[]
  embedded?: boolean
}

export function CustomerQuotationRevisionHistory({
  customerId,
  currentId,
  revisions,
  embedded = false,
}: CustomerQuotationRevisionHistoryProps) {
  return (
    <section
      className={
        embedded
          ? ''
          : 'rounded-xl border border-slate-200 bg-white/90 px-4 py-3.5'
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Historial comercial
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Revisiones
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
          {revisions.length}
        </span>
      </div>

      <div className="mt-2.5 divide-y divide-slate-100 border-t border-slate-100">
        {revisions.map((revision) => {
          const status = getCustomerQuotationStatusPresentation(
            revision.customerStatus,
          )
          const current = revision.id === currentId

          return (
            <Link
              key={revision.id}
              to={`/portal/${customerId}/quotations/${revision.id}`}
              className={
                current
                  ? 'flex items-center justify-between gap-3 rounded-lg bg-blue-50/55 px-2.5 py-2.5 transition'
                  : 'flex items-center justify-between gap-3 px-2.5 py-2.5 transition hover:bg-slate-50'
              }
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-semibold text-slate-900">
                    Revisión {revision.revision}
                  </p>
                  {current ? (
                    <span className="text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
                      Actual
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[8px] text-slate-500">
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
