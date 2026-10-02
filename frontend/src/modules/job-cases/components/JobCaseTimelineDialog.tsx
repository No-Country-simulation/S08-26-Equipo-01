import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useJobCaseTimelineHistory } from '../hooks/useJobCaseTimeline'
import { JobCaseActivityList } from './JobCaseActivityList'

interface JobCaseTimelineDialogProps {
  open: boolean
  caseId: number
  caseNumber: string
  workOrderId?: number | null
  onClose: () => void
}

export function JobCaseTimelineDialog({
  open,
  caseId,
  caseNumber,
  workOrderId = null,
  onClose,
}: JobCaseTimelineDialogProps) {
  const historyQuery = useJobCaseTimelineHistory(caseId, open)
  const events =
    historyQuery.data?.pages.flatMap((page) => page.items) ?? []

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-case-history-title"
        className="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Trazabilidad
          </p>
          <h2
            id="job-case-history-title"
            className="mt-1 text-base font-semibold text-slate-950"
          >
            Historial completo del expediente
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            {caseNumber} · del movimiento más reciente al más antiguo
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {historyQuery.isPending ? (
            <p className="py-8 text-center text-[9px] text-slate-500">
              Cargando historial…
            </p>
          ) : historyQuery.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[9px] leading-4 text-red-700"
            >
              {getErrorMessage(historyQuery.error)}
            </div>
          ) : events.length === 0 ? (
            <p className="py-8 text-center text-[9px] text-slate-500">
              Todavía no hay eventos registrados.
            </p>
          ) : (
            <JobCaseActivityList
              events={events}
              caseId={caseId}
              workOrderId={workOrderId}
            />
          )}

          {historyQuery.isFetchNextPageError ? (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[9px] leading-4 text-red-700"
            >
              {getErrorMessage(historyQuery.error)}
            </div>
          ) : null}

          {historyQuery.hasNextPage ? (
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="!h-8 !px-3 !text-[9px]"
                disabled={historyQuery.isFetchingNextPage}
                onClick={() => void historyQuery.fetchNextPage()}
              >
                {historyQuery.isFetchingNextPage
                  ? 'Cargando…'
                  : 'Cargar eventos anteriores'}
              </Button>
            </div>
          ) : events.length > 0 ? (
            <p className="mt-4 text-center text-[8px] text-slate-400">
              Has llegado al inicio del historial.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
