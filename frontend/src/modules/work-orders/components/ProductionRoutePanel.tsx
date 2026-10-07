import { ProductionBlocker } from './ProductionBlocker'
import { ProductionRouteList } from './ProductionRouteList'
import { RoutingFlowView } from './RoutingFlowView'
import { formatProductionDateTime } from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'

type ProductionRouteView = 'flow' | 'list'

interface ProductionRoutePanelProps {
  actualStartAt: string | null
  actualEndAt: string | null
  operations: RoutingOperationDto[]
  executions: OperationExecutionDto[]
  routingReleased: boolean
  selectedOperationId: number | null
  expandedOperationId: number | null
  completedOperations: number
  totalOperations: number
  progress: number
  routeView: ProductionRouteView
  hasProductionRouting: boolean
  onRouteViewChange: (view: ProductionRouteView) => void
  onSelect: (operationId: number) => void
  onToggleAttempts: (operationId: number) => void
}

export function ProductionRoutePanel({
  actualStartAt,
  actualEndAt,
  operations,
  executions,
  routingReleased,
  selectedOperationId,
  expandedOperationId,
  completedOperations,
  totalOperations,
  progress,
  routeView,
  hasProductionRouting,
  onRouteViewChange,
  onSelect,
  onToggleAttempts,
}: ProductionRoutePanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Ejecución de producción
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Ruta activa de fabricación
            </h2>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              Las ramas pueden avanzar en paralelo cuando sus dependencias estén
              completas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-right">
            <div>
              <p className="text-[7px] text-slate-400">Inicio real</p>
              <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                {formatProductionDateTime(actualStartAt)}
              </p>
            </div>
            <div>
              <p className="text-[7px] text-slate-400">Fin real</p>
              <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                {formatProductionDateTime(actualEndAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 text-[8px] text-slate-500">
            <span>Progreso de operaciones</span>
            <span className="font-semibold text-slate-800">
              {completedOperations}/{totalOperations} · {progress}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {operations.length > 0 ? (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
            <p className="text-[7px] text-slate-400">
              Selecciona una operación para ver sus acciones y estado.
            </p>
            <div className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => onRouteViewChange('flow')}
                className={
                  routeView === 'flow'
                    ? '!h-7 rounded-md bg-white !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-blue-700 shadow-sm'
                    : '!h-7 rounded-md !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-slate-500 hover:text-slate-800'
                }
              >
                Proceso
              </button>
              <button
                type="button"
                onClick={() => onRouteViewChange('list')}
                className={
                  routeView === 'list'
                    ? '!h-7 rounded-md bg-white !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-blue-700 shadow-sm'
                    : '!h-7 rounded-md !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-slate-500 hover:text-slate-800'
                }
              >
                Operaciones
              </button>
            </div>
          </div>

          {routeView === 'flow' ? (
            <div className="p-3">
              <RoutingFlowView
                operations={operations}
                executions={executions}
                routingReleased={routingReleased}
                selectedOperationId={selectedOperationId}
                onSelect={onSelect}
              />
            </div>
          ) : (
            <ProductionRouteList
              operations={operations}
              executions={executions}
              routingReleased={routingReleased}
              selectedOperationId={selectedOperationId}
              expandedOperationId={expandedOperationId}
              onSelect={onSelect}
              onToggleAttempts={onToggleAttempts}
            />
          )}
        </div>
      ) : hasProductionRouting ? (
        <div className="p-4">
          <ProductionBlocker text="La hoja de ruta no contiene operaciones ejecutables." />
        </div>
      ) : null}
    </section>
  )
}
