import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import {
  InternalListingBody,
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
} from '@/shared/components/listing/InternalListing'
import {
  InternalListingCard,
  InternalListingCardFooter,
  InternalListingCardTop,
  InternalListingSummaryCell,
  InternalListingSummaryGrid,
} from '@/shared/components/listing/InternalListingCard'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'
import type { WorkOrderDto, WorkOrderStatus } from '../types/workOrder.types'

type WorkOrderDetailTab = 'production' | 'quality'

interface OperationalWorkOrderQueueProps {
  title: string
  description: string
  workOrders: WorkOrderDto[]
  tab: WorkOrderDetailTab
  emptyTitle: string
  emptyDescription: string
  getActionLabel: (workOrder: WorkOrderDto) => string
}

const statusAccent: Record<WorkOrderStatus, string> = {
  CREATED: 'from-slate-400 to-slate-300',
  READY_FOR_PRODUCTION: 'from-blue-500 to-cyan-400',
  IN_PRODUCTION: 'from-indigo-500 to-violet-400',
  QUALITY_PENDING: 'from-amber-500 to-orange-400',
  QUALITY_HOLD: 'from-red-500 to-rose-400',
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
  QUALITY_HOLD: 'bg-red-50 text-red-600',
  REWORK_IN_PROGRESS: 'bg-amber-50 text-amber-700',
  READY_FOR_DELIVERY: 'bg-emerald-50 text-emerald-600',
  DELIVERED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function OperationalWorkOrderQueue({
  title,
  description,
  workOrders,
  tab,
  emptyTitle,
  emptyDescription,
  getActionLabel,
}: OperationalWorkOrderQueueProps) {
  return (
    <InternalListingPanel className="mt-0">
      <InternalListingHeader
        eyebrow="Trabajo operativo"
        title={title}
        description={description}
      />

      <InternalListingResultsBar
        count={workOrders.length}
        singular="orden visible"
        plural="órdenes visibles"
      />

      <InternalListingBody>
        {workOrders.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-3">
            {workOrders.map((workOrder) => {
              const status = getWorkOrderStatusPresentation(workOrder.status)
              const actionLabel = getActionLabel(workOrder)

              return (
                <InternalListingCard
                  key={workOrder.id}
                  accentClassName={statusAccent[workOrder.status]}
                >
                  <InternalListingCardTop
                    icon={
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[workOrder.status]}`}
                      >
                        <SidebarNavIcon
                          name={tab === 'quality' ? 'quality' : 'production'}
                          className="h-[17px] w-[17px]"
                        />
                      </div>
                    }
                    actions={
                      <>
                        <Badge
                          tone={status.tone}
                          className="px-2.5 py-0.5 text-[9px]"
                        >
                          {status.label}
                        </Badge>
                        <Link
                          to={`/work-orders/${workOrder.id}?tab=${tab}`}
                          className="inline-flex h-9 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                        >
                          {actionLabel}
                        </Link>
                      </>
                    }
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        {workOrder.workOrderNumber}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                        Prioridad{' '}
                        {getWorkOrderPriorityLabel(workOrder.priority).toLowerCase()}
                      </span>
                    </div>

                    <Link
                      to={`/work-orders/${workOrder.id}?tab=${tab}`}
                      className="mt-1.5 block truncate text-sm font-semibold text-slate-950 transition group-hover:text-blue-700"
                    >
                      {workOrder.customerName}
                    </Link>

                    <p className="mt-1 truncate text-[10px] leading-4 text-slate-500">
                      Expediente {workOrder.caseNumber} · Solicitud{' '}
                      {workOrder.requestNumber}
                    </p>
                  </InternalListingCardTop>

                  <InternalListingSummaryGrid>
                    <InternalListingSummaryCell
                      label="Cantidad"
                      value={
                        workOrder.plannedQuantity
                          ? `${workOrder.plannedQuantity} pieza${workOrder.plannedQuantity === 1 ? '' : 's'}`
                          : 'Por definir'
                      }
                    />
                    <InternalListingSummaryCell
                      label="Inicio previsto"
                      value={formatWorkOrderDate(workOrder.plannedStartDate)}
                    />
                    <InternalListingSummaryCell
                      label="Entrega comprometida"
                      value={formatWorkOrderDate(workOrder.agreedDeliveryDate)}
                    />
                  </InternalListingSummaryGrid>

                  <InternalListingCardFooter>
                    <p className="text-[9px] leading-4 text-slate-500">
                      {status.description}
                    </p>
                    <p className="shrink-0 text-[8px] font-semibold text-slate-500">
                      Etapa · {status.stage}
                    </p>
                  </InternalListingCardFooter>
                </InternalListingCard>
              )
            })}
          </div>
        )}
      </InternalListingBody>
    </InternalListingPanel>
  )
}
