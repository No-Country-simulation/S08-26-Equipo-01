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

function contextLabel(status: CustomerQuotationStatus): string | null {
  if (status === 'SENT') return 'Pendiente de decisión'
  if (status === 'ADJUSTMENT_REQUESTED') return 'Comercial prepara una revisión'
  if (status === 'APPROVED') return 'Propuesta aceptada'
  if (status === 'REPLACED') return 'Existe una revisión posterior'
  return null
}

export function CustomerQuotationCard({
  customerId,
  quotation,
}: CustomerQuotationCardProps) {
  const status = getCustomerQuotationStatusPresentation(
    quotation.customerStatus,
  )
  const context = contextLabel(quotation.customerStatus)
  const needsDecision = quotation.customerStatus === 'SENT'

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusAccent[quotation.customerStatus]}`}
      />

      <div className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[quotation.customerStatus]}`}
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
                {needsDecision ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Requiere tu decisión
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.08em] text-blue-600">
                Solicitud de origen · {quotation.requestNumber}
              </p>
              <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                {quotation.requestTitle}
              </h2>
              <p className="mt-1 text-[9px] text-slate-500">
                Expediente {quotation.caseNumber}
              </p>

              {context ? (
                <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                  {context}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
              {status.label}
            </Badge>
            <Link
              to={`/portal/${customerId}/quotations/${quotation.id}`}
              className={
                needsDecision
                  ? 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700'
                  : 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }
            >
              Ver cotización
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-950">
              {formatQuotationMoney(quotation.total, quotation.currency)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Vigencia
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {formatQuotationDate(quotation.validUntil)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Entrega estimada
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {formatQuotationDate(quotation.estimatedDeliveryDate)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
          <p className="truncate text-[8px] font-medium text-slate-400">
            {quotation.requestTitle}
          </p>
          <p className="text-[8px] font-medium text-slate-400">
            {quotation.currency}
          </p>
        </div>
      </div>
    </article>
  )
}
