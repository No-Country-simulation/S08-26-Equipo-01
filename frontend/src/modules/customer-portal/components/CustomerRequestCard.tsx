import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatCustomerRequestDate,
  getCustomerRequestStatusPresentation,
  requestNeedsCustomerResponse,
} from '../model/customerRequestPresenter'
import type {
  CustomerRequestStatus,
  CustomerRequestSummaryDto,
} from '../types/customerRequest.types'

interface CustomerRequestCardProps {
  customerId: number
  request: CustomerRequestSummaryDto
}

const statusAccent: Record<CustomerRequestStatus, string> = {
  SUBMITTED: 'from-amber-500 to-orange-400',
  UNDER_REVIEW: 'from-amber-500 to-orange-400',
  WAITING_CUSTOMER_INFO: 'from-amber-500 to-orange-400',
  READY_FOR_QUOTATION: 'from-blue-500 to-cyan-400',
  IN_PRODUCTION: 'from-indigo-500 to-violet-400',
  COMPLETED: 'from-emerald-500 to-teal-400',
  CANCELLED: 'from-red-500 to-rose-400',
}

const statusSurface: Record<CustomerRequestStatus, string> = {
  SUBMITTED: 'bg-amber-50 text-amber-600',
  UNDER_REVIEW: 'bg-amber-50 text-amber-600',
  WAITING_CUSTOMER_INFO: 'bg-amber-50 text-amber-600',
  READY_FOR_QUOTATION: 'bg-blue-50 text-blue-600',
  IN_PRODUCTION: 'bg-indigo-50 text-indigo-600',
  COMPLETED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

const stageIndex: Record<CustomerRequestStatus, number> = {
  SUBMITTED: 0,
  UNDER_REVIEW: 0,
  WAITING_CUSTOMER_INFO: 0,
  READY_FOR_QUOTATION: 1,
  IN_PRODUCTION: 2,
  COMPLETED: 3,
  CANCELLED: -1,
}

const stages = ['Revisión', 'Cotización', 'Producción', 'Finalizada']

export function CustomerRequestCard({
  customerId,
  request,
}: CustomerRequestCardProps) {
  const status = getCustomerRequestStatusPresentation(request.jobCase.status)
  const needsResponse = requestNeedsCustomerResponse(request)
  const currentStage = stageIndex[request.jobCase.status]

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusAccent[request.jobCase.status]}`}
      />

      <div className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[request.jobCase.status]}`}
            >
              <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {request.requestNumber}
                </p>
                {request.customerReference ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                    Ref. {request.customerReference}
                  </span>
                ) : null}
                {needsResponse ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Requiere tu atención
                  </span>
                ) : null}
              </div>

              <h2 className="mt-1.5 truncate text-sm font-semibold text-slate-950">
                {request.title}
              </h2>

              <p className="mt-1 line-clamp-2 max-w-3xl text-[10px] leading-4 text-slate-500">
                {request.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
              {status.label}
            </Badge>
            <Link
              to={`/portal/${customerId}/requests/${request.id}`}
              className={
                needsResponse
                  ? 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700'
                  : 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }
            >
              {needsResponse ? 'Responder' : 'Ver detalle'}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Cantidad
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Material
            </p>
            <p className="mt-1 truncate text-[10px] font-semibold text-slate-900">
              {request.materialRequirementType === 'SPECIFIED'
                ? request.materialRequirement
                : 'Asesoría técnica requerida'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Fecha requerida
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {formatCustomerRequestDate(request.requestedDeliveryDate)}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          {request.jobCase.status === 'CANCELLED' ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold text-red-600">
                Solicitud cancelada
              </p>
              <p className="text-[8px] text-slate-400">
                {request.jobCase.caseNumber}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Avance del trabajo
                </p>
                <p className="text-[8px] font-semibold text-slate-500">
                  Etapa · {status.stage}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {stages.map((stage, index) => {
                  const reached = index <= currentStage
                  const current = index === currentStage

                  return (
                    <div key={stage} className="min-w-0">
                      <div
                        className={
                          reached
                            ? current
                              ? 'h-1 rounded-full bg-blue-600'
                              : 'h-1 rounded-full bg-blue-300'
                            : 'h-1 rounded-full bg-slate-100'
                        }
                      />
                      <p
                        className={
                          current
                            ? 'mt-1 truncate text-[8px] font-semibold text-blue-700'
                            : reached
                              ? 'mt-1 truncate text-[8px] font-medium text-slate-600'
                              : 'mt-1 truncate text-[8px] font-medium text-slate-400'
                        }
                      >
                        {stage}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
