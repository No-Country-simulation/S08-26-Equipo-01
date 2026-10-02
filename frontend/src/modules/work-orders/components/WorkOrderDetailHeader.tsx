import { useNavigate } from 'react-router-dom'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { Badge } from '@/shared/components/ui/Badge'
import { getWorkOrderStatusPresentation } from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrderDetailDto
  canCancel: boolean
  onCancel: () => void
  onOpenDocuments: () => void
  onOpenTraceability: () => void
}

export function WorkOrderDetailHeader({
  workOrder,
  canCancel,
  onCancel,
  onOpenDocuments,
  onOpenTraceability,
}: WorkOrderDetailHeaderProps) {
  const navigate = useNavigate()
  const status = getWorkOrderStatusPresentation(workOrder.status)

  const closeMenu = (target: EventTarget | null) => {
    const element = target instanceof HTMLElement ? target : null
    element?.closest('details')?.removeAttribute('open')
  }

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/55 px-5 py-4 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
            Orden de trabajo
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
              {workOrder.workOrderNumber}
            </h1>
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl truncate text-[10px] font-medium text-slate-600">
            {workOrder.source.title}
          </p>
          <p className="mt-1 text-[8px] text-slate-400">
            {workOrder.source.customerName}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CompactBackButton
            label="Volver a órdenes"
            onClick={() => navigate('/work-orders')}
          />

          <details className="relative">
            <summary
              aria-label="Más acciones de la orden"
              className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="text-[15px] leading-none">
                •••
              </span>
            </summary>

            <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[9px] font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={(event) => {
                  closeMenu(event.currentTarget)
                  onOpenDocuments()
                }}
              >
                Documentos relacionados
              </button>

              <button
                type="button"
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[9px] font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={(event) => {
                  closeMenu(event.currentTarget)
                  onOpenTraceability()
                }}
              >
                Trazabilidad del expediente
              </button>

              {canCancel ? (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[9px] font-medium text-red-600 transition hover:bg-red-50"
                    onClick={(event) => {
                      closeMenu(event.currentTarget)
                      onCancel()
                    }}
                  >
                    Cancelar orden
                  </button>
                </>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
