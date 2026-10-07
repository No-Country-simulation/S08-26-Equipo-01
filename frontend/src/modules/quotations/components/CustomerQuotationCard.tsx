import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import type {
  CustomerQuotationStatus,
  CustomerQuotationSummaryDto,
} from '../types/customerQuotation.types'

interface CustomerQuotationCardProps {
  customerId: number
  quotation: CustomerQuotationSummaryDto
}

const statusAccent: Record<CustomerQuotationStatus, string> = {
  SENT: 'from-blue-500 to-cyan-400',
  ADJUSTMENT_REQUESTED: 'from-amber-500 to-orange-400',
  APPROVED: 'from-emerald-500 to-teal-400',
  REJECTED: 'from-red-500 to-rose-400',
  EXPIRED: 'from-amber-400 to-yellow-300',
  CANCELLED: 'from-red-500 to-rose-400',
  REPLACED: 'from-slate-400 to-slate-300',
}

const statusSurface: Record<CustomerQuotationStatus, string> = {
  SENT: 'bg-blue-50 text-blue-600',
  ADJUSTMENT_REQUESTED: 'bg-amber-50 text-amber-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-red-50 text-red-600',
  EXPIRED: 'bg-amber-50 text-amber-600',
  CANCELLED: 'bg-red-50 text-red-600',
  REPLACED: 'bg-slate-100 text-slate-500',
}

export function CustomerQuotationCard({
  customerId,
  quotation,
}: CustomerQuotationCardProps) {
  const status = getCustomerQuotationStatusPresentation(
    quotation.customerStatus,
  )
  const needsDecision = quotation.customerStatus === 'SENT'

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_-24px_rgba(15,23,42,0.3)] transition duration-200 hover:border-blue-200 hover:shadow-md">
      <div
        className={`absolute bottom-3 left-0 top-3 w-[2px] rounded-r-full bg-gradient-to-b ${statusAccent[quotation.customerStatus]}`}
      />

      <div className="px-4 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${statusSurface[quotation.customerStatus]}`}
            >
              <SidebarNavIcon name="quotations" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {quotation.quotationNumber}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-500">
                  Rev. {quotation.revision}
                </span>
                {needsDecision ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[7px] font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Requiere tu decisión
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
                Solicitud de origen · {quotation.requestNumber}
              </p>
              <h2 className="mt-0.5 truncate text-[12px] font-semibold text-slate-950">
                {quotation.requestTitle}
              </h2>
              <p className="mt-0.5 text-[8px] text-slate-500">
                Expediente {quotation.caseNumber}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              {status.label}
            </Badge>
            <Link
              to={`/portal/${customerId}/quotations/${quotation.id}`}
              className={
                needsDecision
                  ? 'inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-200/70 transition hover:bg-blue-700'
                  : 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }
            >
              Ver cotización
            </Link>
          </div>
        </div>

        <div className="mt-3 grid border-t border-slate-100 pt-2.5 sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          <CompactFact
            label={`Total · ${quotation.currency}`}
            value={formatQuotationMoney(quotation.total, quotation.currency)}
          />
          <CompactFact
            label="Vigencia"
            value={formatQuotationDate(quotation.validUntil)}
          />
          <CompactFact
            label="Entrega estimada"
            value={formatQuotationDate(quotation.estimatedDeliveryDate)}
          />
        </div>
      </div>
    </article>
  )
}

function CompactFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-1 sm:px-3 first:sm:pl-0 last:sm:pr-0">
      <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-800" title={value}>
        {value}
      </p>
    </div>
  )
}
