import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { WorkOrder360MaterialDto } from '../types/workOrder360.types'

interface ProductionMaterialsCardProps {
  consumptions: WorkOrder360MaterialDto[]
}

export function ProductionMaterialsCard({
  consumptions,
}: ProductionMaterialsCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Materiales
        </p>
        <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
          Consumos registrados
        </h2>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
          Historial de lotes y cantidades realmente consumidas por esta OT.
        </p>
      </div>

      <div className="p-4">
        {consumptions.length === 0 ? (
          <EmptyState
            title="Sin consumo registrado"
            description="Todavía no se han asociado lotes de material a esta orden."
          />
        ) : (
          <div className="grid gap-2">
            {consumptions.map(({ consumption, lot }) => (
              <article
                id={`material-lot-${lot.id}`}
                key={consumption.id}
                className="scroll-mt-24 grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[8px] target:ring-2 target:ring-blue-200 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {consumption.materialCode} · {consumption.materialName}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Lote {consumption.lotNumber}
                    {lot.supplier ? ` · ${lot.supplier}` : ''}
                  </p>
                </div>
                <div className="text-slate-600">
                  Registrado por{' '}
                  {consumption.recordedByName ?? 'usuario de producción'}
                </div>
                <div className="font-semibold text-slate-950">
                  {consumption.quantityUsed} {consumption.unit}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
