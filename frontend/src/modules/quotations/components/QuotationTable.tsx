import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatQuotationDate,
  formatQuotationMoney,
  getQuotationStatusPresentation,
} from '../model/quotationPresenter'
import type { QuotationDto, QuotationStatus } from '../types/quotation.types'

interface QuotationTableProps {
  quotations: QuotationDto[]
}

const statusAccent: Record<QuotationStatus, string> = {
  DRAFT: 'from-slate-400 to-slate-300',
  SENT: 'from-blue-500 to-cyan-400',
  APPROVED: 'from-emerald-500 to-teal-400',
  REJECTED: 'from-red-500 to-rose-400',
  SUPERSEDED: 'from-slate-400 to-slate-300',
  EXPIRED: 'from-amber-500 to-orange-400',
  CANCELLED: 'from-red-500 to-rose-400',
}

const statusSurface: Record<QuotationStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-50 text-blue-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-red-50 text-red-600',
  SUPERSEDED: 'bg-slate-100 text-slate-600',
  EXPIRED: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function QuotationTable({ quotations }: QuotationTableProps) {
  return (
    <div className="space-y-3">
      {quotations.map((quotation) => {
        const status = getQuotationStatusPresentation(quotation.status)
        const actionLabel =
          quotation.status === 'DRAFT' ? 'Continuar' : 'Abrir cotización'

        return (
          <article
            key={quotation.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusAccent[quotation.status]}`}
            />

            <div className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[quotation.status]}`}
                  >
                    <SidebarNavIcon name="quotations" className="h-[17px] w-[17px]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        {quotation.quotationNumber}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                        Rev. {quotation.revision}
                      </span>
                    </div>

                    <Link
                      to={`/quotations/${quotation.id}`}
                      className="mt-1.5 block truncate text-sm font-semibold text-slate-950 transition group-hover:text-blue-700"
                    >
                      {quotation.customerName}
                    </Link>

                    <p className="mt-1 truncate text-[10px] leading-4 text-slate-500">
                      Expediente {quotation.caseNumber} · Solicitud{' '}
                      {quotation.requestNumber}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
                    {status.label}
                  </Badge>
                  <Link
                    to={`/quotations/${quotation.id}`}
                    className={
                      quotation.status === 'DRAFT'
                        ? 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700'
                        : 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                    }
                  >
                    {actionLabel}
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <SummaryCell
                  label="Monto"
                  value={formatQuotationMoney(quotation.total, quotation.currency)}
                />
                <SummaryCell
                  label="Vigencia"
                  value={formatQuotationDate(quotation.validUntil)}
                />
                <SummaryCell
                  label="Entrega estimada"
                  value={formatQuotationDate(quotation.estimatedDeliveryDate)}
                />
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] leading-4 text-slate-500">
                  {status.description}
                </p>
                <p className="shrink-0 text-[8px] font-semibold text-slate-500">
                  Etapa · {status.stage}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-[10px] font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}
