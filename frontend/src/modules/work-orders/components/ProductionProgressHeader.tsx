import { Badge } from '@/shared/components/ui/Badge'
import { formatProductionDateTime } from '../model/productionPresenter'
import type {
  ProductionStatusDto,
  RoutingSheetDto,
} from '../types/workOrder.types'

interface ProductionProgressHeaderProps {
  production: ProductionStatusDto
  routing?: RoutingSheetDto
  completedOperations: number
}

export function ProductionProgressHeader({
  production,
  routing,
  completedOperations,
}: ProductionProgressHeaderProps) {
  const totalOperations = routing?.operations.length ?? 0
  const progress =
    totalOperations > 0
      ? Math.round((completedOperations / totalOperations) * 100)
      : 0

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Producción
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Ejecución real de planta
          </h2>
        </div>

        <Badge
          tone={
            production.productionCompleted
              ? 'success'
              : production.status === 'IN_PRODUCTION'
                ? 'warning'
                : 'neutral'
          }
          className="px-2 py-0.5 text-[8px]"
        >
          {production.productionCompleted
            ? 'Producción completada'
            : production.status === 'IN_PRODUCTION'
              ? 'En producción'
              : 'Pendiente de iniciar'}
        </Badge>
      </div>

      <div className="grid gap-3 px-4 py-3.5 md:grid-cols-[1fr_150px_150px]">
        <div>
          <div className="flex items-center justify-between text-[8px] text-slate-500">
            <span>Progreso de operaciones</span>
            <span className="font-semibold text-slate-800">
              {completedOperations}/{totalOperations} · {progress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-[8px] text-slate-400">Inicio real</p>
          <p className="mt-1 text-[9px] font-semibold text-slate-800">
            {formatProductionDateTime(production.actualStartAt)}
          </p>
        </div>

        <div>
          <p className="text-[8px] text-slate-400">Fin real</p>
          <p className="mt-1 text-[9px] font-semibold text-slate-800">
            {formatProductionDateTime(production.actualEndAt)}
          </p>
        </div>
      </div>
    </section>
  )
}
