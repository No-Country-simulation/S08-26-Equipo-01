import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { NonConformityCard } from './NonConformityCard'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface NonConformitySectionProps {
  data: WorkOrder360Dto
}

export function NonConformitySection({ data }: NonConformitySectionProps) {
  const nonConformities = [...data.nonConformities].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'OPEN' ? -1 : 1
    return right.id - left.id
  })

  if (nonConformities.length === 0) {
    return (
      <EmptyState
        title="Sin no conformidades"
        description="Las NC aparecen cuando una inspección termina REJECTED."
      />
    )
  }

  return (
    <section className="space-y-2.5">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
          No conformidades y retrabajo
        </p>
        <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
          Resolución sin perder la historia original
        </h2>
        <p className="mt-0.5 max-w-3xl text-[8px] leading-4 text-slate-500">
          Cada corrección conserva la inspección y ejecución original y crea su propio ciclo trazable.
        </p>
      </div>

      {nonConformities.map((nonConformity) => (
        <NonConformityCard
          key={nonConformity.id}
          nonConformity={nonConformity}
          routingSheets={data.routingSheets}
          executions={data.production.executions}
          workOrderStatus={data.workOrder.status}
        />
      ))}
    </section>
  )
}
