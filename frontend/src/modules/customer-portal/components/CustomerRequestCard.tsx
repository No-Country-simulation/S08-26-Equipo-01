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
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_-24px_rgba(15,23,42,0.3)] transition duration-200 hover:border-blue-200 hover:shadow-md">
      <div
        className={`absolute bottom-3 left-0 top-3 w-[2px] rounded-r-full bg-gradient-to-b ${statusAccent[request.jobCase.status]}`}
      />

      <div className="px-4 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${statusSurface[request.jobCase.status]}`}
            >
              <SidebarNavIcon name="requests" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {request.requestNumber}
                </p>
                {request.customerReference ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-500">
                    Ref. {request.customerReference}
                  </span>
                ) : null}
                {needsResponse ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[7px] font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Requiere tu atención
                  </span>
                ) : null}
              </div>

              <h2 className="mt-1 truncate text-[12px] font-semibold text-slate-950">
                {request.title}
              </h2>

              {request.description ? (
                <p className="mt-0.5 line-clamp-1 max-w-3xl text-[9px] leading-4 text-slate-500">
                  {request.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              {status.label}
            </Badge>
            <Link
              to={`/portal/${customerId}/requests/${request.id}`}
              className={
                needsResponse
                  ? 'inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-200/70 transition hover:bg-blue-700'
                  : 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }
            >
              {needsResponse ? 'Responder' : 'Ver detalle'}
            </Link>
          </div>
        </div>

        <div className="mt-3 grid border-t border-slate-100 pt-2.5 sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          <CompactFact
            label="Cantidad"
            value={`${request.quantity} pieza${request.quantity === 1 ? '' : 's'}`}
          />
          <CompactFact
            label="Material"
            value={
              request.materialRequirementType === 'SPECIFIED'
                ? request.materialRequirement || 'Sin definir'
                : 'Asesoría técnica requerida'
            }
          />
          <CompactFact
            label="Fecha requerida"
            value={formatCustomerRequestDate(request.requestedDeliveryDate)}
          />
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          {request.jobCase.status === 'CANCELLED' ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[8px] font-semibold text-red-600">
                Solicitud cancelada
              </p>
              <p className="text-[7px] text-slate-400">
                {request.jobCase.caseNumber}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Avance del trabajo
                </p>
                <p className="text-[7px] font-semibold text-slate-500">
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
                              ? 'h-0.5 rounded-full bg-blue-600'
                              : 'h-0.5 rounded-full bg-blue-300'
                            : 'h-0.5 rounded-full bg-slate-100'
                        }
                      />
                      <p
                        className={
                          current
                            ? 'mt-1 truncate text-[7px] font-semibold text-blue-700'
                            : reached
                              ? 'mt-1 truncate text-[7px] font-medium text-slate-600'
                              : 'mt-1 truncate text-[7px] font-medium text-slate-400'
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
