import type { AuthenticatedUser } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getJobCaseCapabilities } from '../model/jobCaseCapabilities'
import { formatJobCaseDate } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseAssignmentCardProps {
  jobCase: JobCaseDetailDto
  user: AuthenticatedUser
  taking: boolean
  onTake: () => void
}

export function JobCaseAssignmentCard({
  jobCase,
  user,
  taking,
  onTake,
}: JobCaseAssignmentCardProps) {
  const capabilities = getJobCaseCapabilities(jobCase, user)
  const assigned = jobCase.assignedToUserId !== null

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.26)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Responsable de revisión
            </p>
            {assigned ? (
              <Badge tone="info" className="px-2 py-0.5 text-[8px]">
                Asignado
              </Badge>
            ) : (
              <Badge tone="neutral" className="px-2 py-0.5 text-[8px]">
                Sin responsable
              </Badge>
            )}
          </div>

          {assigned ? (
            <>
              <p className="mt-1 text-[12px] font-semibold text-slate-950">
                {jobCase.assignedToName ?? 'Responsable asignado'}
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                Tomado para revisión · {formatJobCaseDate(jobCase.assignedAt)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-[12px] font-semibold text-slate-950">
                Este expediente todavía no tiene responsable
              </p>
              <p className="mt-1 max-w-3xl text-[9px] leading-4 text-slate-500">
                Puedes consultar los datos, documentos y aclaraciones antes de
                asignártelo. Tómalo cuando vayas a comenzar la revisión interna.
              </p>
            </>
          )}
        </div>

        {capabilities.canTake ? (
          <div className="shrink-0 sm:text-right">
            <Button
              size="sm"
              className="!h-8 !w-full !justify-center !px-4 !text-[9px] sm:!w-auto"
              onClick={onTake}
              disabled={taking}
            >
              {taking ? 'Asignando…' : 'Tomar para revisión'}
            </Button>
            <p className="mt-1.5 text-[8px] leading-3 text-slate-400">
              No completa ni aprueba el expediente.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
