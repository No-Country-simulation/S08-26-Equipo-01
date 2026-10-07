import { useMemo } from 'react'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { OperationalWorkOrderQueue } from '../components/OperationalWorkOrderQueue'
import { useWorkOrders } from '../hooks/useWorkOrders'
import type { WorkOrderDto, WorkOrderPriority } from '../types/workOrder.types'

const priorityWeight: Record<WorkOrderPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
}

function sortQualityQueue(workOrders: WorkOrderDto[]): WorkOrderDto[] {
  const statusWeight = {
    QUALITY_HOLD: 0,
    REWORK_IN_PROGRESS: 1,
    QUALITY_PENDING: 2,
  } as const

  return [...workOrders].sort((left, right) => {
    const statusDifference =
      statusWeight[left.status as keyof typeof statusWeight] -
      statusWeight[right.status as keyof typeof statusWeight]

    if (statusDifference !== 0) return statusDifference

    return priorityWeight[left.priority] - priorityWeight[right.priority]
  })
}

export function QualityPage() {
  const query = useWorkOrders()

  const queue = useMemo(
    () =>
      sortQualityQueue(
        (query.data ?? []).filter(
          (workOrder) =>
            workOrder.status === 'QUALITY_PENDING' ||
            workOrder.status === 'QUALITY_HOLD' ||
            workOrder.status === 'REWORK_IN_PROGRESS',
        ),
      ),
    [query.data],
  )

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cola de calidad…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState error={query.error} title="No pudimos cargar Calidad" />
      </PageContainer>
    )
  }

  const pending = queue.filter(
    (workOrder) => workOrder.status === 'QUALITY_PENDING',
  ).length
  const onHold = queue.filter(
    (workOrder) => workOrder.status === 'QUALITY_HOLD',
  ).length
  const rework = queue.filter(
    (workOrder) => workOrder.status === 'REWORK_IN_PROGRESS',
  ).length

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="quality" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Calidad
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Atiende inspecciones pendientes, órdenes pausadas por una no
                conformidad y ciclos de retrabajo desde su Expediente 360.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">
                En cola de calidad
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {queue.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Pendientes
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-blue-700">
                {pending}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Pausadas por calidad
              </p>
              <p
                className={
                  onHold > 0
                    ? 'mt-0.5 text-[16px] font-bold text-red-600'
                    : 'mt-0.5 text-[16px] font-bold text-slate-950'
                }
              >
                {onHold}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                En retrabajo
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {rework}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <OperationalWorkOrderQueue
          title="Cola de calidad"
          description="Las órdenes pausadas por calidad aparecen primero, seguidas por retrabajos y nuevas inspecciones pendientes."
          workOrders={queue}
          tab="quality"
          emptyTitle="Sin trabajo pendiente de calidad"
          emptyDescription="Las órdenes aparecerán aquí al enviarse a Calidad o cuando una no conformidad mantenga la orden pausada."
          getActionLabel={(workOrder) => {
            if (workOrder.status === 'QUALITY_HOLD') return 'Resolver'
            if (workOrder.status === 'REWORK_IN_PROGRESS') return 'Continuar'
            return 'Revisar'
          }}
        />
      </div>
    </PageContainer>
  )
}
