import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import type { CustomerQuotationSummaryDto } from '../types/customerQuotation.types'

interface CustomerQuotationTableProps {
  customerId: number
  quotations: CustomerQuotationSummaryDto[]
}

export function CustomerQuotationTable({
  customerId,
  quotations,
}: CustomerQuotationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-4 py-3">Cotización</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Vigencia</th>
            <th className="px-4 py-3">Entrega estimada</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quotation) => {
            const status = getCustomerQuotationStatusPresentation(
              quotation.customerStatus,
            )

            return (
              <tr
                key={quotation.id}
                className="border-b border-slate-100 text-xs text-slate-700 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {quotation.quotationNumber}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Rev {quotation.revision} · {quotation.requestNumber}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone} className="text-[10px]">
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-4 font-semibold text-slate-900">
                  {formatQuotationMoney(quotation.total, quotation.currency)}
                </td>
                <td className="px-4 py-4">
                  {formatQuotationDate(quotation.validUntil)}
                </td>
                <td className="px-4 py-4">
                  {formatQuotationDate(quotation.estimatedDeliveryDate)}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/portal/${customerId}/quotations/${quotation.id}`}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Ver cotización
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
