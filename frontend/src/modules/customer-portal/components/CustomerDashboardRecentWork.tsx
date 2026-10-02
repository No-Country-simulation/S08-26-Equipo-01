import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import {
  formatCustomerRequestDateTime,
  getCustomerRequestStatusPresentation,
} from '../model/customerRequestPresenter'
import type { CustomerRequestSummaryDto } from '../types/customerRequest.types'

interface CustomerDashboardRecentWorkProps {
  customerId: number
  requests: CustomerRequestSummaryDto[]
}

export function CustomerDashboardRecentWork({
  customerId,
  requests,
}: CustomerDashboardRecentWorkProps) {
  const recent = [...requests]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4)

  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-teal-50/35 px-5 py-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-700">
            Seguimiento
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Trabajos recientes
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Los últimos movimientos de tus solicitudes.
          </p>
        </div>

        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-semibold text-teal-700">
          {requests.length} total
        </span>
      </div>

      {recent.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {recent.map((request) => {
            const status = getCustomerRequestStatusPresentation(
              request.jobCase.status,
            )

            return (
              <Link
                key={request.id}
                to={`/portal/${customerId}/requests/${request.id}`}
                className="group block px-5 py-3.5 transition hover:bg-slate-50/80"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xs font-semibold text-slate-900 transition group-hover:text-blue-700">
                        {request.title}
                      </p>
                      <Badge
                        tone={status.tone}
                        className="px-2 py-0.5 text-[9px]"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {request.requestNumber} · {request.jobCase.caseNumber}
                    </p>
                  </div>

                  <time className="shrink-0 text-[9px] text-slate-400">
                    {formatCustomerRequestDateTime(request.updatedAt)}
                  </time>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">
            Todavía no hay trabajos
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Tus solicitudes aparecerán aquí conforme las registres.
          </p>
        </div>
      )}

      {recent.length > 0 ? (
        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-right">
          <Link
            to={`/portal/${customerId}/requests`}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver todas las solicitudes →
          </Link>
        </div>
      ) : null}
    </Card>
  )
}
