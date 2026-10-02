import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import type { WorkOrderDto, WorkOrderStatus } from '../types/workOrder.types'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'

interface WorkOrderTableProps {
  workOrders: WorkOrderDto[]
}

const statusAccent: Record<WorkOrderStatus, string> = {
  CREATED: 'from-slate-400 to-slate-300',
  READY_FOR_PRODUCTION: 'from-blue-500 to-cyan-400',
  IN_PRODUCTION: 'from-indigo-500 to-violet-400',
  QUALITY_PENDING: 'from-amber-500 to-orange-400',
  QUALITY_HOLD: 'from-amber-500 to-orange-400',
  REWORK_IN_PROGRESS: 'from-amber-500 to-orange-400',
  READY_FOR_DELIVERY: 'from-emerald-500 to-teal-400',
  DELIVERED: 'from-emerald-500 to-teal-400',
  CANCELLED: 'from-red-500 to-rose-400',
}

const statusSurface: Record<WorkOrderStatus, string> = {
  CREATED: 'bg-slate-100 text-slate-600',
  READY_FOR_PRODUCTION: 'bg-blue-50 text-blue-600',
  IN_PRODUCTION: 'bg-indigo-50 text-indigo-600',
  QUALITY_PENDING: 'bg-amber-50 text-amber-700',
  QUALITY_HOLD: 'bg-amber-50 text-amber-700',
  REWORK_IN_PROGRESS: 'bg-amber-50 text-amber-700',
  READY_FOR_DELIVERY: 'bg-emerald-50 text-emerald-600',
  DELIVERED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  return (
    <div className="space-y-3">
      {workOrders.map((workOrder) => {
        const status = getWorkOrderStatusPresentation(workOrder.status)
        const priority = getWorkOrderPriorityLabel(workOrder.priority)
        const actionLabel =
          workOrder.status === 'DELIVERED' ? 'Abrir historial' : 'Abrir orden'

        return (
          <article
            key={workOrder.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusAccent[workOrder.status]}`}
            />

            <div className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[workOrder.status]}`}
                  >
                    <SidebarNavIcon name="work-orders" className="h-[17px] w-[17px]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        {workOrder.workOrderNumber}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                        Prioridad {priority.toLowerCase()}
                      </span>
                    </div>

                    <Link
                      to={`/work-orders/${workOrder.id}`}
                      className="mt-1.5 block truncate text-sm font-semibold text-slate-950 transition group-hover:text-blue-700"
                    >
                      {workOrder.customerName}
                    </Link>

                    <p className="mt-1 truncate text-[10px] leading-4 text-slate-500">
                      Expediente {workOrder.caseNumber} · Solicitud{' '}
                      {workOrder.requestNumber}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
                    {status.label}
                  </Badge>
                  <Link
                    to={`/work-orders/${workOrder.id}`}
                    className={
                      workOrder.status === 'CREATED'
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
                  label="Origen comercial"
                  value={`${workOrder.approvedQuotationNumber} · Rev. ${workOrder.approvedQuotationRevision}`}
                />
                <SummaryCell
                  label="Planeación"
                  value={
                    workOrder.plannedQuantity
                      ? `${workOrder.plannedQuantity} pieza${workOrder.plannedQuantity === 1 ? '' : 's'}`
                      : 'Cantidad por definir'
                  }
                />
                <SummaryCell
                  label="Entrega comprometida"
                  value={formatWorkOrderDate(workOrder.agreedDeliveryDate)}
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
