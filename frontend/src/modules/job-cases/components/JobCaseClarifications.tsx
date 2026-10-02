import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { formatJobCaseDateTime } from '../model/jobCasePresenter'
import type { CaseInformationRequestDto } from '../types/jobCase.types'

interface JobCaseClarificationsProps {
  requests: CaseInformationRequestDto[]
}

export function JobCaseClarifications({
  requests,
}: JobCaseClarificationsProps) {
  if (requests.length === 0) {
    return (
      <Card className="border-blue-100/70 bg-gradient-to-br from-white via-white to-blue-50/20 p-4">
        <EmptyState
          title="Sin aclaraciones"
          description="No se han solicitado aclaraciones al cliente para este expediente."
        />
      </Card>
    )
  }

  const pending = requests.filter((request) => request.open).length

  return (
    <Card id="clarifications" className="scroll-mt-24 h-full overflow-hidden border-blue-100/70 bg-gradient-to-br from-white via-white to-blue-50/20 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-3 border-b border-blue-100/70 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Comunicación con cliente
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Preguntas y respuestas
            </h2>
            <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
              Consulta qué se preguntó, quién respondió y si queda algo por
              resolver.
            </p>
          </div>
        </div>

        <span
          className={
            pending > 0
              ? 'shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-700'
              : 'shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700'
          }
        >
          {pending > 0
            ? `${pending} pendiente${pending === 1 ? '' : 's'}`
            : 'Sin pendientes'}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {requests.map((request) => (
          <article
            id={`clarification-${request.id}`}
            key={request.id}
            className="scroll-mt-24 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-5 text-slate-900">
                  {request.question}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  Solicitada por {request.requestedByName ?? 'Sistema'} ·{' '}
                  {formatJobCaseDateTime(request.requestedAt)}
                </p>
              </div>

              <Badge
                tone={request.open ? 'warning' : 'success'}
                className="px-2 py-0.5 text-[8px]"
              >
                {request.open ? 'Pendiente' : 'Respondida'}
              </Badge>
            </div>

            {request.response ? (
              <div className="mt-3 border-l-2 border-emerald-300 pl-3">
                <p className="text-[10px] leading-5 text-slate-700">
                  {request.response}
                </p>
                <p className="mt-1 text-[8px] text-slate-400">
                  Respondida por {request.respondedByName ?? 'Cliente'} ·{' '}
                  {formatJobCaseDateTime(request.respondedAt)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[10px] font-semibold text-amber-700">
                Pendiente de respuesta del cliente
              </p>
            )}
          </article>
        ))}
      </div>
    </Card>
  )
}
