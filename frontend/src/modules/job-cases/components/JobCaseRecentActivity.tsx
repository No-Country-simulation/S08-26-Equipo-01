import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import type { JobCaseTimelineEventDto } from '../types/jobCase.types'
import { JobCaseActivityList } from './JobCaseActivityList'

interface JobCaseRecentActivityProps {
  caseId: number
  workOrderId?: number | null
  events: JobCaseTimelineEventDto[]
  hasMore: boolean
  onOpenHistory: () => void
}

export function JobCaseRecentActivity({
  caseId,
  workOrderId = null,
  events,
  hasMore,
  onOpenHistory,
}: JobCaseRecentActivityProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Trazabilidad
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Trazabilidad reciente
          </h2>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Cada movimiento conserva el contexto y enlaza al recurso relacionado cuando sigue disponible.
          </p>
        </div>

        {hasMore ? (
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onOpenHistory}
          >
            Ver historial completo
          </Button>
        ) : null}
      </div>

      <div className="px-4 py-3.5">
        {events.length === 0 ? (
          <EmptyState
            title="Sin actividad"
            description="Todavía no hay movimientos registrados para este expediente."
          />
        ) : (
          <>
            <JobCaseActivityList
            events={events}
            caseId={caseId}
            workOrderId={workOrderId}
          />
            {hasMore ? (
              <p className="mt-3 text-[8px] text-slate-400">
                Se muestran únicamente los movimientos más recientes.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
