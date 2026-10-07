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

function sortProductionQueue(workOrders: WorkOrderDto[]): WorkOrderDto[] {
  return [...workOrders].sort((left, right) => {
    const statusDifference =
      (left.status === 'IN_PRODUCTION' ? 0 : 1) -
      (right.status === 'IN_PRODUCTION' ? 0 : 1)

    if (statusDifference !== 0) return statusDifference

    return priorityWeight[left.priority] - priorityWeight[right.priority]
  })
}

export function ProductionPage() {
  const query = useWorkOrders()

  const queue = useMemo(
    () =>
      sortProductionQueue(
        (query.data ?? []).filter(
          (workOrder) =>
            workOrder.status === 'READY_FOR_PRODUCTION' ||
            workOrder.status === 'IN_PRODUCTION',
        ),
      ),
    [query.data],
  )

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cola de producción…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState error={query.error} title="No pudimos cargar Producción" />
      </PageContainer>
    )
  }

  const ready = queue.filter(
    (workOrder) => workOrder.status === 'READY_FOR_PRODUCTION',
  ).length
  const inProduction = queue.filter(
    (workOrder) => workOrder.status === 'IN_PRODUCTION',
  ).length
  const urgent = queue.filter(
    (workOrder) => workOrder.priority === 'URGENT',
  ).length

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="production" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Producción
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Prioriza órdenes liberadas, continúa operaciones activas y entra
                al Expediente 360 para registrar la ejecución real de planta.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">En cola</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {queue.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Listas para iniciar
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-blue-700">
                {ready}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                En ejecución
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {inProduction}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Prioridad urgente
              </p>
              <p
                className={
                  urgent > 0
                    ? 'mt-0.5 text-[16px] font-bold text-red-600'
                    : 'mt-0.5 text-[16px] font-bold text-slate-950'
                }
              >
                {urgent}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <OperationalWorkOrderQueue
          title="Cola de producción"
          description="Las órdenes en ejecución aparecen primero y, dentro de cada estado, se priorizan por urgencia."
          workOrders={queue}
          tab="production"
          emptyTitle="Sin trabajo pendiente de producción"
          emptyDescription="Las órdenes aparecerán aquí cuando su hoja de ruta de producción sea liberada."
          getActionLabel={(workOrder) =>
            workOrder.status === 'IN_PRODUCTION' ? 'Continuar' : 'Iniciar'
          }
        />
      </div>
    </PageContainer>
  )
}
